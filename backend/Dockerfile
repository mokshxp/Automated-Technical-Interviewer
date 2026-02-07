FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Command is overridden by docker-compose, but good to have a default
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
