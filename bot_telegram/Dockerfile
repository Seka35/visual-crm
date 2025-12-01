FROM python:3.11-slim

WORKDIR /app

# Copie requirements et installe
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie tout le code
COPY . .

# Lance le bot
CMD ["python", "main.py"]