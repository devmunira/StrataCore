# StrataCore (Enterprise Node.js Framework Documentation)

## 🚀 Project Overview

This is a **production-ready Node.js framework** built with TypeScript that implements enterprise-level design patterns and provides a robust foundation for building scalable REST APIs. The framework is designed to eliminate boilerplate code, enforce best practices, and provide a consistent development experience across different database drivers.

### 🎯 Problems Solved

1. **Boilerplate Code Elimination**: Reduces repetitive CRUD operations by 80% through base classes and decorators
2. **Database Agnostic**: Seamlessly switch between MySQL and PostgreSQL without code changes
3. **Type Safety**: Full TypeScript support with compile-time error checking
4. **Consistent Error Handling**: Centralized error management with proper JSON responses
5. **Scalable Architecture**: Modular design that grows with your application
6. **Developer Experience**: Intuitive decorators and automatic route registration

### ✨ Key Features

#### 🏗️ **Architecture & Design Patterns**

- **Dependency Injection** with TSyringe for loose coupling
- **Repository Pattern** for data access abstraction
- **Service Layer Pattern** for business logic separation
- **Decorator Pattern** for metadata-driven development
- **Factory Pattern** for database driver creation
- **Singleton Pattern** for configuration management

#### 🎨 **Custom Decorators System**

```typescript
@Controller('/api/v1/users')
@Guard([AuthGuard])
export class UserController {
  @Get('/')
  @TryCatch()
  async findAll(req: Request, res: Response) {
    // Your logic here
  }
}
```

#### 🔍 **Advanced Query Builder**

- **Dynamic Filtering**: Complex queries with AND/OR combinations
- **Type-Safe Operators**: 15+ built-in operators (equals, contains, between, etc.)
- **Nested Conditions**: Support for deeply nested filter groups
- **SQL Injection Protection**: Built-in parameterization

#### 🗄️ **Multi-Database Support**

- **MySQL Driver**: Full MySQL 8.0+ support
- **PostgreSQL Driver**: Full PostgreSQL 15+ support
- **Unified API**: Same code works with both databases
- **Connection Pooling**: Optimized connection management
- **Migration Support**: Drizzle ORM migrations

#### 📝 **Validation & Error Handling**

- **Zod Integration**: Runtime type validation
- **Centralized Error Handling**: Consistent error responses
- **TryCatch Decorator**: Automatic error wrapping
- **Validation Decorators**: Request/response validation

#### 📊 **Logging System**

- **Multi-Output Support**: Console and file logging
- **Log Rotation**: Automatic log file management
- **Structured Logging**: JSON format with metadata
- **Performance Tracking**: Query execution time logging

## 🏛️ Architecture Overview

```
src/
├── config/                 # Configuration management
├── libs/                   # Core framework libraries
│   ├── database/          # Database abstraction layer
│   ├── decorator/         # Custom decorators
│   ├── logger/            # Logging system
│   ├── repository/        # Data access layer
│   └── service/           # Business logic layer
├── db/                    # Database schemas & migrations
├── middlewares/           # Express middlewares
├── modules/               # Feature modules
└── utils/                 # Utility functions
```

### 🔧 Core Components

#### 1. **Database Layer**

- **IDatabaseClient**: Unified database interface
- **DatabaseConnectionPool**: Connection management
- **Driver Pattern**: Pluggable database drivers
- **Query Execution**: Centralized query handling with logging

#### 2. **Repository Layer**

- **BaseRepository**: Generic CRUD operations
- **FilterBuilder**: Dynamic query construction
- **Type Safety**: Full TypeScript integration

#### 3. **Service Layer**

- **BaseService**: Business logic foundation
- **Dependency Injection**: Automatic service resolution
- **Transaction Support**: Database transaction handling

#### 4. **Decorator System**

- **@Controller**: Route registration
- **@Guard**: Middleware injection
- **@TryCatch**: Error handling
- **Route Decorators**: HTTP method mapping

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- TypeScript knowledge

### 1. **Clone & Install**

```bash
git clone <repository-url>
cd framework
npm install
```

### 2. **Environment Setup**

Create `.env` file:

```env
# Database Configuration
DATABASE_DRIVER=postgresql  # or mysql
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/framework
DATABASE_MAX_CONNECTION=10
DATABASE_IDLE_TIMEOUT=10000
DATABASE_CONNECTION_TIMEOUT=10000
MAXUSES=10
SSL=false

# Logging Configuration
FILE_LOG_RETENTION_DAYS=7
FILE_LOG_ZIP_INSTEAD_DELETE=true

# Server Configuration
PORT=4000
```

### 3. **Database Setup**

#### Option A: Using Docker (Recommended)

```bash
# Start databases
docker-compose up -d

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migration

# View database (optional)
npm run db:studio
```

#### Option B: Local Database Setup

**PostgreSQL:**

```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt-get install postgresql  # Ubuntu

# Create database
createdb framework
```

**MySQL:**

```bash
# Install MySQL
brew install mysql  # macOS
sudo apt-get install mysql-server  # Ubuntu

# Create database
mysql -u root -p -e "CREATE DATABASE framework;"
```

### 4. **Development**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📚 Usage Examples

### 1. **Creating a New Module**

[Check out setup guide](./docs/Setup-Guide.md)

### 2. **Advanced Filtering**

```typescript
// Complex query with nested conditions
const filter: FilterRuleGroup = {
  combinator: 'and',
  rules: [
    { field: 'price', operator: '>', value: 100 },
    { field: 'category', operator: '=', value: 'electronics' },
    {
      combinator: 'or',
      rules: [
        { field: 'brand', operator: '=', value: 'Apple' },
        { field: 'brand', operator: '=', value: 'Samsung' },
      ],
    },
  ],
};

const products = await productService.findAll({ where: filter });
```

### 3. **Custom Middleware**

```typescript
// src/middlewares/rate-limit.middleware.ts
export function RateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Your rate limiting logic
  next();
}

// Usage in controller
@Controller('/api/v1/users')
@Guard([RateLimitMiddleware, AuthGuard])
export class UserController {
  // ...
}
```

## 🔧 Configuration

### Database Configuration

```typescript
// src/config/app.config.ts
export class AppConfig {
  private loadConfiguration(): IAppConfig {
    return {
      database: {
        url: this.getRequiredEnvVar('DATABASE_URL'),
        maxConnection: this.parseIntEnv('DATABASE_MAX_CONNECTION', 10),
        idleTimeout: this.parseIntEnv('DATABASE_IDLE_TIMEOUT', 10000),
        connectionTimeout: this.parseIntEnv(
          'DATABASE_CONNECTION_TIMEOUT',
          10000,
        ),
        maxUses: this.parseIntEnv('MAXUSES', 10),
        ssl: this.parseBooleanEnv('SSL', false),
        driver: this.getRequiredEnvVar('DATABASE_DRIVER') as DatabaseDriver,
      },
    };
  }
}
```

### Logging Configuration

```typescript
// Multiple logger support
Logger.register(new ConsoleLogger(), new FileLogger());

// Structured logging
Logger.info('User created', { userId: 123, email: 'user@example.com' });
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["npm", "start"]
```

## 📄 License

MIT License - see LICENSE file for details

**Built by Munira with ❤️ and HardWork using TypeScript, Express, and Drizzle ORM**
