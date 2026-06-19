FROM python:3.11-slim AS b
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim
RUN useradd -m appuser
RUN mkdir -p /app/migrations && chown -R appuser:appuser /app
USER appuser
WORKDIR /app
COPY --from=b /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=b /usr/local/bin /usr/local/bin
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
