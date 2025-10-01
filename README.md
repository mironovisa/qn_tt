# QuickNotes SaaS

## Features

### Backend (NestJS)
- **JWT Authentication** with secure registration and login
- **CRUD Operations** for notes with advanced filtering
- **Search & Filter** by title, content, and tags
- **Cursor-based Pagination** for optimal performance
- **Redis Caching** for improved response times
- **Rate Limiting** with DDoS protection
- **Swagger Documentation** with comprehensive API docs
- **Health Checks** and Prometheus metrics
- **Database**: PostgreSQL with TypeORM

### Frontend (React + Vite)
- **Modern UI** with minimalist Japanese-inspired design
- **TypeScript** for type safety
- **Form Validation** using Zod + React Hook Form
- **Real-time Search** with debounced input
- **Tag Management** with autocomplete suggestions
- **Responsive Design** optimized for mobile
- **Authentication** with Remember Me functionality
- **Infinite Scroll** pagination

### DevOps & Infrastructure
- **Docker Compose** orchestration
- **Nginx Load Balancer** for high availability
- **Service Scaling** capability (2-5 instances)
- **Health Monitoring** endpoints
- **Development Environment** with hot reload

## Requirements

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

##  Quick Start

### Using Docker (Recommended)

1. **Clone and setup**:
   ```bash
   git clone (https://github.com/mironovisa/qn_tt.git)
   cd eldar_tt
   make setup  # Creates .env from .env.example
   ```

2. **Start all services**:
   ```bash
   make up
   # Or: docker-compose up -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8001
   - Swagger Docs: http://localhost:8001/api/docs
   - Load Balancer: http://localhost:8080

### Development Setup

1. **Backend setup**:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Frontend setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Docker Commands

| Command | Description |
|---------|-------------|
| `make setup` | Create .env from template |
| `make build` | Build all Docker images |
| `make up` | Start all services |
| `make down` | Stop all services |
| `make restart` | Restart all services |
| `make backend` | Start backend + infrastructure only |
| `make scale-2` | Scale API to 2 instances |
| `make scale-5` | Scale API to 5 instances |
| `make logs` | Show container logs |
| `make test` | Run E2E tests |

### Service Ports

- **Frontend**: 8080 (via nginx load balancer)
- **Backend**: 8001 (via nginx load balancer)  
- **Nginx**: 8080 (frontend), 8001 (API)
- **PostgreSQL**: 5432 (internal)
- **Redis**: 6379 (internal)

## API Documentation (You can find Swagger on the backend)

### Authentication Endpoints
- `POST /auth/register` - Create new account
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Notes Endpoints
- `GET /notes` - List notes (paginated, searchable)
- `POST /notes` - Create new note
- `GET /notes/:id` - Get specific note
- `PATCH /notes/:id` - Update note
- `PUT /notes/:id` - Replace note
- `DELETE /notes/:id` - Delete note
- `GET /notes/tags` - Get all tags

### Search & Filter
```bash
# Search by content
GET /notes?search=meeting

# Filter by tags
GET /notes?tags=work,important

# Sort options
GET /notes?sortBy=createdAt&sortOrder=DESC

# Pagination
GET /notes?limit=10&cursor=uuid-cursor
```

### Health & Monitoring
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** (5 auth requests/min, 20 CRUD/min, 60 read/min)
- **Input Validation** with class-validator
- **XSS Protection** with DOMPurify
- **CORS** configuration
- **Password Hashing** with bcrypt


## 📁 Project Structure

```
eldar_tt/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── notes/          # Notes CRUD module
│   │   ├── users/          # User management
│   │   ├── health/         # Health checks
│   │   └── pagination/     # Pagination service
│   ├── test/               # E2E tests
│   └── Dockerfile
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── styles.css      # Global styles
│   └── Dockerfile
├── nginx/                  # Load balancer config
├── docker-compose.yml      # Service orchestration
├── Makefile               # Development commands
└── README.md              # This file
```

## Production Deployment

### Scale for Production
```bash
# Scale API instances
make scale-5

# Check service status
docker-compose ps

# Monitor logs
make logs
```

### Health Monitoring
- Health endpoint: `GET /health`
- Metrics: `GET /metrics`
- Load balancer status via nginx logs


### Adding Features
1. Backend: Add modules in `src/`
2. Frontend: Add components in `src/`
3. Update API docs in controllers
4. Add tests in `test/`

## Performance

- **Caching**: Redis for API responses and tags
- **Pagination**: Cursor-based for large datasets
- **Database**: Optimized queries with indexes
- **Load Balancing**: Nginx upstream for scaling
- **Compression**: Gzip enabled
- **Rate Limiting**: Prevents abuse

##  Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check ports
   lsof -i :5173,:8001,:8080
   # Change ports in docker-compose.yml
   ```

2. **Database connection**:
   ```bash
   # Check PostgreSQL
   docker-compose logs postgres
   # Reset database
   docker-compose down -v && make up
   ```

3. **Cache issues**:
   ```bash
   # Clear Redis cache
   docker-compose exec redis redis-cli FLUSHALL
   ```

## License

This project is part of a technical assessment and is for evaluation purposes.
