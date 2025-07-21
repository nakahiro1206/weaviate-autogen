FROM python:3.12-slim-bookworm
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy application code
COPY . .

# Sync the project into a new environment, asserting the lockfile is up to date
RUN uv sync --locked

# Expose port
EXPOSE 8002

# Install netcat for health check
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Run the server
CMD ["uv", "run", "python", "server.py"] 