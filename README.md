# Real Estate MVP - Leads Generation Platform

A scalable, test-driven backend for a real estate leads generation platform focused on hyper-local listings and agent-buyer matchmaking.

## 🚀 Tech Stack

### Backend

- **Node.js 18+** with **TypeScript 5+**
- **Express.js** - REST API framework
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL 14+** - Primary database
- **Redis** - Caching layer

### Testing

- **Jest** - Test runner with TypeScript support
- **Supertest** - API endpoint testing
- **@faker-js/faker** - Test data generation
- **80%+ code coverage** requirement

### Additional Tools

- **Zod** - Runtime validation
- **JWT + Passport.js** - Authentication
- **Bull** - Background job queue
- **Winston** - Structured logging
- **Swagger/OpenAPI** - API documentation
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **PostgreSQL** 14.x or higher
- **Redis** 6.x or higher
- **Git**

### Installation Guides

#### macOS

```bash
# Install Node.js
brew install node@18

# Install PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Install Redis
brew install redis
brew services start redis
```

#### Windows

```bash
# Download and install Node.js from https://nodejs.org/
# Download and install PostgreSQL from https://www.postgresql.org/download/windows/
# Download and install Redis from https://redis.io/download/ or use WSL
```

#### Linux (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql-14

# Install Redis
sudo apt-get install redis-server
```

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd re_demo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cd apps/api
cp .env.example .env
```

Edit `.env` with your local configuration:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/realestate_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-change-in-production
```

### 4. Create PostgreSQL databases

```bash
# Connect to PostgreSQL
psql postgres

# In PostgreSQL shell:
CREATE DATABASE realestate_dev;
CREATE DATABASE realestate_test;
\q
```

### 5. Run Prisma migrations

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Seed the database (optional)

```bash
npm run prisma:seed
```

This creates test accounts:

- **Agent 1**: agent1@example.com / Password123!
- **Agent 2**: agent2@example.com / Password123!
- **Buyer 1**: buyer1@example.com / Password123!
- **Buyer 2**: buyer2@example.com / Password123!

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:4000`

### Production Mode

```bash
npm run build
npm start
```

### Run Tests

```bash
# Run all tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:ci

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## 📚 API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:4000/api-docs
```

For a complete API reference, see [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md).

### Health Check

```
GET http://localhost:4000/health
```

## 🔑 Authentication Endpoints

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "BUYER",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <your-jwt-token>
```

## 🧪 Test-Driven Development (TDD)

This project follows strict TDD principles:

### TDD Workflow

1. **Write failing test first** (RED)
2. **Implement minimum code to pass** (GREEN)
3. **Refactor for quality** (REFACTOR)
4. **Commit and move to next test**

### Example Test

```typescript
describe('POST /api/v1/auth/register', () => {
  it('should register a new user with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'BUYER',
      })
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });
});
```

## 📁 Project Structure

```
re_demo/
├── apps/
│   ├── api/                      # Express backend
│   │   ├── src/
│   │   │   ├── config/           # Configuration files
│   │   │   ├── middleware/       # Express middleware
│   │   │   ├── modules/          # Feature modules
│   │   │   │   ├── auth/         # Authentication
│   │   │   │   ├── property/     # Property listings
│   │   │   │   ├── lead/         # Lead management
│   │   │   │   ├── showing/      # Showing requests
│   │   │   │   ├── neighborhood/ # Neighborhood data
│   │   │   │   ├── market/       # Market analytics
│   │   │   │   ├── tools/        # Mortgage calculator
│   │   │   │   └── agent/        # Agent profiles
│   │   │   ├── utils/            # Utility functions
│   │   │   ├── types/            # TypeScript types
│   │   │   ├── app.ts            # Express app setup
│   │   │   └── server.ts         # Server entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   └── seed.ts           # Database seeding
│   │   ├── tests/                # Test setup and helpers
│   │   └── package.json
│   └── web/                      # React frontend (Vite)
├── docs/
│   └── API_ENDPOINTS.md          # Complete API reference
├── .github/
│   └── workflows/
│       └── ci.yml                # CI/CD pipeline
├── package.json                  # Root package.json
└── README.md
```

## 🔧 Available Scripts

### Root Level

```bash
npm run dev          # Start development server
npm run build        # Build all workspaces
npm run test         # Run tests
npm run lint         # Lint all workspaces
npm run format       # Format code with Prettier
```

### API Workspace

```bash
npm run dev                  # Start dev server with hot reload
npm run build                # Compile TypeScript
npm run start                # Start production server
npm run test                 # Run tests in watch mode
npm run test:ci              # Run tests once with coverage
npm run test:unit            # Run only unit tests
npm run test:integration     # Run only integration tests
npm run lint                 # Check for linting errors
npm run lint:fix             # Auto-fix linting errors
npm run prisma:generate      # Generate Prisma Client
npm run prisma:migrate       # Create and run migration
npm run prisma:seed          # Seed database
npm run prisma:studio        # Open Prisma Studio GUI
```

## 🔐 Environment Variables

| Variable         | Description                  | Default                  |
| ---------------- | ---------------------------- | ------------------------ |
| `NODE_ENV`       | Environment mode             | `development`            |
| `PORT`           | Server port                  | `4000`                   |
| `DATABASE_URL`   | PostgreSQL connection string | -                        |
| `REDIS_URL`      | Redis connection string      | `redis://localhost:6379` |
| `JWT_SECRET`     | Secret key for JWT           | -                        |
| `JWT_EXPIRES_IN` | JWT expiration time          | `7d`                     |
| `CORS_ORIGIN`    | Allowed CORS origin          | `http://localhost:3000`  |

## 🚦 CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

- ✅ Linting
- ✅ Type checking
- ✅ Running tests with coverage
- ✅ Building the application
- ✅ PostgreSQL and Redis services in CI

## 🤝 Contributing

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes following TDD
# 1. Write test
# 2. Make test pass
# 3. Refactor
# 4. Commit

git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `test:` Adding tests
- `refactor:` Code refactoring
- `docs:` Documentation changes
- `chore:` Maintenance tasks

## 🐛 Troubleshooting

### Cannot connect to database

```bash
# Check if PostgreSQL is running
brew services list  # macOS
sudo service postgresql status  # Linux

# Verify connection string in .env
DATABASE_URL="postgresql://username:password@localhost:5432/realestate_dev"
```

### Prisma Client not generated

```bash
npx prisma generate
```

### Tests timing out

Increase timeout in `jest.config.js`:

```javascript
testTimeout: 10000,  // 10 seconds
```

### Port already in use

```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill  # macOS/Linux
# Or change PORT in .env
```

### Redis connection failed

```bash
# Check if Redis is running
redis-cli ping  # Should return "PONG"

# Start Redis
brew services start redis  # macOS
sudo service redis-server start  # Linux
```

## 📈 Features & Roadmap

### ✅ Completed Features

- [x] **Authentication** - Register, login, JWT tokens, refresh tokens
- [x] **Property CRUD** - Create, read, update, delete listings
- [x] **Advanced Search** - Filter by price, beds, baths, location, amenities
- [x] **Geolocation Search** - Find properties within radius
- [x] **Favorites** - Save and manage favorite properties
- [x] **View History** - Track property views
- [x] **Price History** - Track listing price changes
- [x] **Comparables** - Find similar properties nearby
- [x] **Property Estimates** - Zestimate-style valuations
- [x] **Lead Management** - Inquiry system with status tracking
- [x] **Showing Requests** - Schedule and manage property showings
- [x] **Agent Profiles** - Agent search, reviews, statistics
- [x] **Agent Dashboard** - Performance metrics, lead pipeline
- [x] **Neighborhood Data** - Schools, crime, demographics (mock)
- [x] **Market Analytics** - Trends, forecasts, hot markets (mock)
- [x] **Mortgage Tools** - Calculator, affordability, pre-qualification

### 🚧 Upcoming Features

- [ ] Real-time notifications (WebSocket)
- [ ] Email notifications
- [ ] Image upload to S3/Cloudinary
- [ ] MLS data integration
- [ ] Saved search alerts
- [ ] Virtual tour integration
- [ ] Chat between buyers and agents

## 📝 License

This project is proprietary and confidential.

## 📞 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ using Test-Driven Development**
