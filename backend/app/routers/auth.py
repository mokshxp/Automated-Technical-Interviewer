from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from ..database import get_db
from ..models import User, Candidate, Subscription
from ..utils import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class SubscriptionResponse(BaseModel):
    plan_type: str
    billing_interval: str
    start_date: datetime
    end_date: datetime
    status: str

    class Config:
        from_attributes = True

class UpgradeRequest(BaseModel):
    interval: str # "weekly", "monthly", "yearly"

# Dependency to get current user
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Check if user exists
        result = await db.execute(select(User).where(User.email == user.email))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash password
        hashed_password = get_password_hash(user.password)

        # Create User
        new_user = User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
        db.add(new_user)
        await db.flush() # Generate ID
        
        # Auto-create Candidate profile linked to user
        new_candidate = Candidate(
            name=user.full_name,
            email=user.email,
            resume_url="pending_upload", 
            user_id=new_user.id
        )
        db.add(new_candidate)
        
        await db.commit()
        await db.refresh(new_user)
        
        return new_user
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Signup Failed: {str(e)}")

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # Find user
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate Token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/me/subscription", response_model=SubscriptionResponse)
async def get_my_subscription(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
    subscription = result.scalars().first()
    
    if not subscription:
        # Return a "free" or empty status instead of 404
        return {
            "plan_type": "free",
            "billing_interval": "none",
            "start_date": datetime.utcnow(),
            "end_date": datetime.utcnow(),
            "status": "inactive"
        }
    return subscription

@router.post("/upgrade")
async def upgrade_account(
    request: UpgradeRequest, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    try:
        # Calculate end date based on interval
        days = 7 if request.interval == "weekly" else (30 if request.interval == "monthly" else 365)
        end_date = datetime.utcnow() + timedelta(days=days)

        # Check existing
        result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
        subscription = result.scalars().first()

        if subscription:
            subscription.billing_interval = request.interval
            subscription.end_date = end_date
            subscription.status = "active"
        else:
            new_sub = Subscription(
                user_id=current_user.id,
                plan_type="premium",
                billing_interval=request.interval,
                end_date=end_date,
                status="active"
            )
            db.add(new_sub)
        
        await db.commit()
        return {"status": "success", "message": f"Upgraded to premium ({request.interval})"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
