from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    candidates = relationship("Candidate", back_populates="user")
    subscription = relationship("Subscription", back_populates="user", uselist=False)

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, index=True, nullable=False)
    resume_url = Column(String, nullable=False)
    resume_text = Column(String, nullable=True)
    status = Column(String, default="processing", nullable=False) # processing, ready, failed
    analytics = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Link to User
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) 
    user = relationship("User", back_populates="candidates")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    options = Column(JSON)
    correct_answer = Column(Integer)
    difficulty = Column(String)
    tags = Column(JSON)
    candidate_id = Column(Integer, ForeignKey("candidates.id")) # Keep for history/ref?
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=True) # Link to specific session

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    status = Column(String, default="pending") 
    score = Column(Integer, default=0)
    
    # Valid States: resume_analysis -> prep_oa -> oa_mcq -> prep_coding -> oa_coding -> 
    #               prep_tech_1 -> tech_1 -> prep_tech_2 -> tech_2 -> completed
    current_round = Column(String, default="resume_analysis") 
    round_data = Column(JSON, default={}) 
    
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)


    # Unidirectional relationship to Candidate
    candidate = relationship("Candidate")
    questions = relationship("Question", backref="session")

    # New Fields for Immutable Results
    decision = Column(String, nullable=True) # "Hire", "No Hire", "Strong Hire"
    breakdown = Column(JSON, nullable=True) # Detailed scoring breakdown

class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    interview_session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    data = Column(JSON, nullable=False) # The frozen analytics data
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Candidate")
    session = relationship("InterviewSession")

class CodingProblem(Base):
    __tablename__ = "coding_problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    difficulty = Column(String, default="medium") # easy, medium, hard
    starter_code = Column(String, nullable=False) # e.g., "def solution(args): pass"
    test_cases = Column(JSON, nullable=False) # List of {input: any, output: any, hidden: bool}
    created_at = Column(DateTime, default=datetime.utcnow)

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    plan_type = Column(String, default="premium") # e.g. "premium"
    billing_interval = Column(String, nullable=False) # "weekly", "monthly", "yearly"
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, default="active") # "active", "expired", "canceled"

    # Relationship
    user = relationship("User", back_populates="subscription")

