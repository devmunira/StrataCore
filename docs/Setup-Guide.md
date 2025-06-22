# Database Setup Guide

## 🗄️ Database Driver Setup

This guide provides detailed instructions for setting up both MySQL and PostgreSQL drivers in the framework.

## 📋 Prerequisites

- Node.js 22+
- Docker & Docker Compose (recommended)
- TypeScript knowledge
- Basic understanding of SQL databases

## 🚀 Creating a New Module - Step by Step Guide

This section shows you how to create a complete feature module from scratch, following the framework's architecture patterns.

### Step 1: Define Database Schema

First, create your database schema based on your chosen database driver.

#### For PostgreSQL:

```typescript
// src/db/schemas/postgresql/schemas/product.schemas.ts
import { createInsertSchema } from 'drizzle-zod';
import {
  varchar,
  uuid,
  pgTable,
  pgEnum,
  timestamp,
  decimal,
  integer,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const ProductCategory = pgEnum('product_categories', [
  'electronics',
  'clothing',
  'books',
  'home',
]);
export const ProductStatus = pgEnum('product_status', [
  'active',
  'inactive',
  'out_of_stock',
]);

export const productTable = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: ProductCategory('category').default('electronics'),
  status: ProductStatus('status').default('active'),
  stockQuantity: integer('stock_quantity').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Create Zod schemas for validation
export const CreateProductSchema = createInsertSchema(productTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProductSchema = CreateProductSchema.partial();

// TypeScript types
export type Product = typeof productTable.$inferSelect;
export type CreateProduct = typeof productTable.$inferInsert;
export type UpdateProduct = Partial<CreateProduct>;
```

#### For MySQL:

```typescript
// src/db/schemas/mysql/schemas/product.schemas.ts
import { createInsertSchema } from 'drizzle-zod';
import {
  varchar,
  int,
  mysqlTable,
  mysqlEnum,
  timestamp,
  decimal,
} from 'drizzle-orm/mysql-core';
import { z } from 'zod';

export const productTable = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: mysqlEnum('category', [
    'electronics',
    'clothing',
    'books',
    'home',
  ]).default('electronics'),
  status: mysqlEnum('status', ['active', 'inactive', 'out_of_stock']).default(
    'active',
  ),
  stockQuantity: int('stock_quantity').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Create Zod schemas for validation
export const CreateProductSchema = createInsertSchema(productTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProductSchema = CreateProductSchema.partial();

// TypeScript types
export type Product = typeof productTable.$inferSelect;
export type CreateProduct = typeof productTable.$inferInsert;
export type UpdateProduct = Partial<CreateProduct>;
```

### Step 2: Export Schema from Index

Add your schema to the main schema index file:

```typescript
// src/db/schemas/postgresql/schemas/index.ts
export * from './user.schemas';
export * from './product.schemas'; // Add this line
```

```typescript
// src/db/schemas/mysql/schemas/index.ts
export * from './user.schemas';
export * from './product.schemas'; // Add this line
```

### Step 3: Generate and Run Migrations

```bash
# Generate migrations based on your schema changes
npm run db:generate

# Run migrations to create the new table
npm run db:migration

# Optional: View the database to verify the table was created
npm run db:studio
```

### Step 4: Create Repository

Create a repository that extends BaseRepository with appropriate generics:

```typescript
// src/modules/product/Product.repository.ts
import { injectable } from 'tsyringe';
import { BaseRepository } from '@/libs/repository/classes/BaseRepository';
import {
  DatabaseClientToken,
  IDatabaseClient,
} from '@/libs/database/IDatabaseClient.interface';
import { productTable } from '@/db/schemas/postgresql/schemas/product.schemas'; // or mysql

// Define the table type with required methods
type ProductTable = typeof productTable & {
  $dynamic(): any;
  $select(): any;
  $returning(): any;
};

@injectable()
export class ProductRepository extends BaseRepository<ProductTable> {
  constructor(@inject(DatabaseClientToken) db: IDatabaseClient) {
    super(db, productTable as ProductTable);
  }

  // Add custom repository methods if needed
  async findByCategory(
    category: string,
  ): Promise<ProductTable['$inferSelect'][]> {
    return this.findAll({
      where: this.buildWhereClause('category', '=', category),
    });
  }

  async findInStock(): Promise<ProductTable['$inferSelect'][]> {
    return this.findAll({
      where: this.buildWhereClause('stockQuantity', '>', 0),
    });
  }

  private buildWhereClause(field: string, operator: string, value: any) {
    // This would use your FilterBuilder to create SQL conditions
    // Implementation depends on your specific FilterBuilder setup
    return { field, operator, value };
  }
}
```

### Step 5: Create Service

Create a service that extends BaseService with appropriate generics:

```typescript
// src/modules/product/Product.service.ts
import { injectable } from 'tsyringe';
import { BaseService } from '@/libs/service/classes/BaseService';
import { ProductRepository } from './Product.repository';
import { productTable } from '@/db/schemas/postgresql/schemas/product.schemas'; // or mysql
import {
  CreateProduct,
  UpdateProduct,
} from '@/db/schemas/postgresql/schemas/product.schemas';

@injectable()
export class ProductService extends BaseService<
  typeof productTable,
  ProductRepository
> {
  constructor(readonly repository: ProductRepository) {
    super(repository);
  }

  // Add custom business logic methods
  async createProduct(data: CreateProduct) {
    // Add business validation
    if (data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    return this.create(data);
  }

  async updateProductStock(id: string, quantity: number) {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const newQuantity = product.stockQuantity + quantity;
    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }

    return this.update(id, { stockQuantity: newQuantity });
  }

  async getProductsByCategory(category: string) {
    return this.repository.findByCategory(category);
  }

  async getAvailableProducts() {
    return this.repository.findInStock();
  }
}
```

### Step 6: Create Controller

Create a controller with routes using decorators:

```typescript
// src/modules/product/Product.controller.ts
import { injectable } from 'tsyringe';
import { Controller, Get, Post, Put, Delete, Guard } from '@/libs/decorator';
import { ProductService } from './Product.service';
import { Request, Response } from 'express';
import {
  CreateProductSchema,
  UpdateProductSchema,
} from '@/db/schemas/postgresql/schemas/product.schemas'; // or mysql
import { AuthGuard } from '@/middlewares';

@injectable()
@Controller('/api/v1/products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get('/')
  @Guard([AuthGuard])
  async findAll(req: Request, res: Response) {
    const products = await this.service.findAll();
    res.json(products);
  }

  @Get('/:id')
  async findById(req: Request, res: Response) {
    const product = await this.service.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  }

  @Get('/category/:category')
  async findByCategory(req: Request, res: Response) {
    const products = await this.service.getProductsByCategory(
      req.params.category,
    );
    res.json(products);
  }

  @Get('/available/stock')
  async getAvailableProducts(req: Request, res: Response) {
    const products = await this.service.getAvailableProducts();
    res.json(products);
  }

  @Post('/')
  async create(req: Request, res: Response) {
    const parsedData = CreateProductSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        message: 'Invalid input data',
        errors: parsedData.error.issues,
      });
    }

    const product = await this.service.createProduct(parsedData.data);
    res.status(201).json(product);
  }

  @Put('/:id')
  async update(req: Request, res: Response) {
    const parsedData = UpdateProductSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        message: 'Invalid input data',
        errors: parsedData.error.issues,
      });
    }

    const product = await this.service.update(req.params.id, parsedData.data);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  }

  @Put('/:id/stock')
  async updateStock(req: Request, res: Response) {
    const { quantity } = req.body;
    if (typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Quantity must be a number' });
    }

    try {
      const product = await this.service.updateProductStock(
        req.params.id,
        quantity,
      );
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  @Delete('/:id')
  async delete(req: Request, res: Response) {
    await this.service.delete(req.params.id);
    res.status(204).send();
  }
}
```

### Step 7: Register Module in App

Add your controller to the app registration:

```typescript
// src/app.ts
import { ProductController } from './modules/product/Product.controller';

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(express.json());
  dotenv.config();

  // Register controllers
  registerControllers(app, [
    UserController,
    ProductController, // Add this line
  ]);

  // Error handling middleware
  const errorHandler: ErrorRequestHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    // ... error handling logic
  };

  app.use(errorHandler);

  return app;
};
```

### Step 8: Test Your Module

Create test requests using the provided `api.http` file:

```http
### Get all products
GET http://localhost:4000/api/v1/products

### Get product by ID
GET http://localhost:4000/api/v1/products/123

### Get products by category
GET http://localhost:4000/api/v1/products/category/electronics

### Get available products
GET http://localhost:4000/api/v1/products/available/stock

### Create new product
POST http://localhost:4000/api/v1/products
Content-Type: application/json

{
  "name": "iPhone 15",
  "description": "Latest iPhone model",
  "price": 999.99,
  "category": "electronics",
  "stockQuantity": 50
}

### Update product
PUT http://localhost:4000/api/v1/products/123
Content-Type: application/json

{
  "price": 899.99,
  "description": "Updated description"
}

### Update stock
PUT http://localhost:4000/api/v1/products/123/stock
Content-Type: application/json

{
  "quantity": -5
}

### Delete product
DELETE http://localhost:4000/api/v1/products/123
```

## 🎯 Module Structure Summary

Your complete module structure should look like this:

```
src/
├── db/schemas/
│   ├── postgresql/schemas/
│   │   ├── product.schemas.ts    # Step 1
│   │   └── index.ts              # Step 2
│   └── mysql/schemas/
│       ├── product.schemas.ts    # Step 1
│       └── index.ts              # Step 2
├── modules/product/
│   ├── Product.repository.ts     # Step 4
│   ├── Product.service.ts        # Step 5
│   └── Product.controller.ts     # Step 6
└── app.ts                        # Step 7
```

## 🔧 Key Points to Remember

1. **Schema First**: Always define your database schema before creating other components
2. **Type Safety**: Use TypeScript generics properly in Repository and Service
3. **Validation**: Use Zod schemas for request validation
4. **Error Handling**: Implement proper error handling in your service layer
5. **Dependency Injection**: Use `@injectable()` decorator for all classes
6. **Testing**: Test your endpoints after creation

## 🚀 Quick Module Template

For quick module creation, you can use this template:

```bash
# Create module directory
mkdir -p src/modules/your-module

# Create files
touch src/modules/your-module/YourModule.repository.ts
touch src/modules/your-module/YourModule.service.ts
touch src/modules/your-module/YourModule.controller.ts

# Create schema
touch src/db/schemas/postgresql/schemas/your-module.schemas.ts
touch src/db/schemas/mysql/schemas/your-module.schemas.ts
```

Follow the steps above, replacing "product" with your module name and adjusting the schema fields as needed.

---

## 🐳 Quick Start with Docker (Recommended)

### 1. **Start Databases**

```bash
# Start both MySQL and PostgreSQL
docker-compose up -d

# Verify containers are running
docker-compose ps
```

### 2. **Environment Configuration**

Create `.env` file in the root directory:

```env
# Choose your database driver
DATABASE_DRIVER=postgresql  # or mysql

# PostgreSQL Configuration
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

### 3. **Database Migration**

```bash
# Generate migrations based on your schemas
npm run db:generate

# Run migrations to create tables
npm run db:migration

# Optional: View database with Drizzle Studio
npm run db:studio
```

### 4. **Start Development Server**

```bash
npm run dev
```

## 🐘 PostgreSQL Setup

### Option A: Docker (Recommended)

```bash
# Start PostgreSQL container
docker-compose up postgres -d

# Environment variables for PostgreSQL
DATABASE_DRIVER=postgresql
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/framework
```

### Option B: Local Installation

#### macOS

```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb framework

# Create user (optional)
createuser -P postgres
```

#### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE framework;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE framework TO postgres;
\q
```

#### Windows

```bash
# Download from https://www.postgresql.org/download/windows/
# Install with default settings
# Create database using pgAdmin or psql
```

### PostgreSQL Configuration

```env
DATABASE_DRIVER=postgresql
DATABASE_URL=postgresql://username:password@localhost:5432/framework
DATABASE_MAX_CONNECTION=10
DATABASE_IDLE_TIMEOUT=10000
DATABASE_CONNECTION_TIMEOUT=10000
MAXUSES=10
SSL=false
```

## 🐬 MySQL Setup

### Option A: Docker (Recommended)

```bash
# Start MySQL container
docker-compose up mysql -d

# Environment variables for MySQL
DATABASE_DRIVER=mysql
DATABASE_URL=mysql://root:password@localhost:3306/framework
```

### Option B: Local Installation

#### macOS

```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation

# Create database
mysql -u root -p -e "CREATE DATABASE framework;"
```

#### Ubuntu/Debian

```bash
# Install MySQL
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p -e "CREATE DATABASE framework;"
```

#### Windows

```bash
# Download from https://dev.mysql.com/downloads/mysql/
# Install with default settings
# Create database using MySQL Workbench or command line
```

### MySQL Configuration

```env
DATABASE_DRIVER=mysql
DATABASE_URL=mysql://username:password@localhost:3306/framework
DATABASE_MAX_CONNECTION=10
DATABASE_IDLE_TIMEOUT=10000
DATABASE_CONNECTION_TIMEOUT=10000
MAXUSES=10
SSL=false
```

## 🔄 Switching Between Databases

### 1. **Change Environment Variable**

```env
# For PostgreSQL
DATABASE_DRIVER=postgresql
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/framework

# For MySQL
DATABASE_DRIVER=mysql
DATABASE_URL=mysql://root:password@localhost:3306/framework
```

### 2. **Update Drizzle Configuration**

The framework automatically detects the database driver and uses the appropriate configuration.

### 3. **Run Migrations**

```bash
# Generate new migrations
npm run db:generate

# Run migrations
npm run db:migration
```

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Need help? Check the main documentation or create an issue in the repository.**
