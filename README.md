# Weaviate + AutoGen(developed)

## Usage

### Production Setup

To run the production environment:

```bash
docker-compose up -d
```

This will start:

- Frontend application on port 3000
- Weaviate vector database on port 8080

### Development Setup

To run the development environment with hot reloading:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Development features include:

- Source code mounting for live development
- Debug-friendly configurations

### Individual Services

To run only specific services:

```bash
# Run only frontend and Weaviate
docker-compose up frontend weaviate
```

## Environment Variables

## Volumes

The following volumes are mounted:

- `./storage:/app/storage`: Shared storage directory

## Building

To rebuild all services:

```bash
docker-compose build
```

To rebuild specific services:

```bash
docker-compose build frontend
```

## Logs

To view logs for all services:

```bash
docker-compose logs -f
```

To view logs for specific services:

```bash
docker-compose logs -f frontend
```

## Stopping Services

To stop all services:

```bash
docker-compose down
```

To stop and remove volumes:

```bash
docker-compose down -v
```

## Troubleshooting

### Port Conflicts

If you encounter port conflicts, you can modify the port mappings in the docker-compose files:

```yaml
ports:
  - "3001:3001" # Change 3001 to an available port
```
