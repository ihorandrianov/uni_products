# Microservices Product Management System
## Services

### Products Service
- Product CRUD operations with pagination
- Prometheus metrics integration
- Swagger API documentation
- PostgreSQL database integration

### Notifications Service
- Listens for product events via AWS SQS
- Logs product creation and deletion events

## Technology Stack

- TypeScript & NestJS
- PostgreSQL
- AWS SQS via LocalStack
- Prometheus for metrics
- Flyway for database migrations
- Docker & Docker Compose
- Jest for testing

## Prerequisites

- Docker and Docker Compose
- Node.js 22+
- npm

## Getting Started

1. Clone the repository
2. run ```cd .deploy```
3. run ```cp .env.example .env```
4. run ```docker compose up -d --build```
5. Checkout docs at ```http://localhost:3000/docs```

## Available Endpoints

### Products Service (port 3000)
- `POST /products` - Create product
- `DELETE /products/:id` - Delete product
- `GET /products?limit=10&cursor=0` - Get paginated products
- `GET /metrics` - Prometheus metrics
- `GET /docs` - Swagger documentation

## Prometheus
- Prometheus: ```http://localhost:9090```

## Testing

```bash
npm test
```
