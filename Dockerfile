
# Use official lightweight Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for pyodbc + SQL Server
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    unixodbc-dev \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./backend .

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
