# 🛒 Ecommerce API

A production-ready REST API for an e-commerce platform built with Spring Boot 3, PostgreSQL, and JWT authentication. Includes full CRUD for products, categories, users, orders, shopping cart, and product reviews — with Swagger UI for interactive testing.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Commands](#commands)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Architecture](#architecture)
- [Database Schema](#database-schema)

---

## Features

- **JWT Authentication** — Stateless auth with Bearer tokens, 24-hour expiry
- **Role-based Access Control** — `ROLE_USER` and `ROLE_ADMIN` with method-level security
- **Products CRUD** — Create, read, update, delete with category association and name search
- **Pagination & Filtering** — Page, sort, and filter products by category, price range, and name
- **Categories CRUD** — Full management, admin-only write access
- **Orders** — Place orders with automatic stock deduction, full status lifecycle
- **Shopping Cart** — Persistent cart per user, survives logout, quantity management
- **Product Reviews** — Star rating (1–5), comment, one review per user per product, admin delete
- **Users** — Admin-only user management
- **Bean Validation** — Request validation on all endpoints with structured error responses
- **Global Exception Handler** — Consistent JSON error responses across all failure types
- **Swagger / OpenAPI** — Interactive API docs with JWT authorization support
- **Test Coverage** — Unit tests, MockMvc integration tests, and `@DataJpaTest` repository tests

---

## Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Language         | Java 17+                            |
| Framework        | Spring Boot 3.2.3                   |
| Security         | Spring Security + JWT (JJWT 0.12)   |
| Data Access      | Spring Data JPA (Hibernate)         |
| Database         | PostgreSQL (prod) / H2 (test)       |
| Validation       | Jakarta Bean Validation             |
| API Docs         | SpringDoc OpenAPI (Swagger UI)      |
| Boilerplate      | Lombok                              |
| Build Tool       | Maven                               |
| Testing          | JUnit 5, Mockito, MockMvc, DataJpaTest |

---

## Project Structure

```
src/
├── main/
│   ├── java/com/ecommerce/
│   │   ├── EcommerceApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java          # JWT filter chain, RBAC rules
│   │   │   └── SwaggerConfig.java           # OpenAPI + Bearer auth setup
│   │   ├── controller/
│   │   │   ├── AuthController.java          # POST /api/auth/**
│   │   │   ├── CategoryController.java      # CRUD /api/categories
│   │   │   ├── ProductController.java       # CRUD /api/products + pagination
│   │   │   ├── OrderController.java         # CRUD /api/orders
│   │   │   ├── CartController.java          # /api/cart
│   │   │   ├── ReviewController.java        # /api/products/{id}/reviews
│   │   │   └── UserController.java          # /api/users (admin only)
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── CategoryRequest.java
│   │   │   │   ├── ProductRequest.java
│   │   │   │   ├── OrderRequest.java
│   │   │   │   ├── CartItemRequest.java
│   │   │   │   └── ReviewRequest.java
│   │   │   └── response/
│   │   │       ├── AuthResponse.java
│   │   │       ├── CategoryResponse.java
│   │   │       ├── ProductResponse.java
│   │   │       ├── OrderResponse.java
│   │   │       ├── CartResponse.java
│   │   │       ├── ReviewResponse.java
│   │   │       └── UserResponse.java
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Category.java
│   │   │   ├── Product.java
│   │   │   ├── Order.java
│   │   │   ├── OrderItem.java
│   │   │   ├── Cart.java
│   │   │   ├── CartItem.java
│   │   │   └── Review.java
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── ResourceNotFoundException.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── CategoryRepository.java
│   │   │   ├── ProductRepository.java
│   │   │   ├── OrderRepository.java
│   │   │   ├── CartRepository.java
│   │   │   └── ReviewRepository.java
│   │   ├── security/
│   │   │   ├── JwtService.java
│   │   │   ├── JwtAuthFilter.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   └── service/
│   │       ├── AuthService.java
│   │       ├── CategoryService.java
│   │       ├── ProductService.java
│   │       ├── OrderService.java
│   │       ├── CartService.java
│   │       ├── ReviewService.java
│   │       └── UserService.java
│   └── resources/
│       └── application.properties
└── test/
    ├── java/com/ecommerce/
    │   ├── controller/
    │   │   └── ProductControllerIntegrationTest.java
    │   ├── repository/
    │   │   └── ReviewRepositoryTest.java
    │   └── service/
    │       ├── CartServiceTest.java
    │       └── ReviewServiceTest.java
    └── resources/
        └── application-test.properties
```

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 15+

### 1. Clone the repository

```bash
git clone https://github.com/yourname/ecommerce-api.git
cd ecommerce-api
```

### 2. Start PostgreSQL

**Windows (PowerShell as Administrator):**
```bash
net start postgresql-x64-16
# or
Start-Service -Name "postgresql-x64-16"
```

**Verify it's running:**
```bash
psql -U postgres -c "\l"
```

### 3. Create the database

```bash
psql -U postgres -c "CREATE DATABASE ecommerce;"
```

### 4. Configure `application.properties`

Edit `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/ecommerce
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
spring.datasource.hikari.connection-test-query=SELECT 1

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.expiration-ms=86400000

# Swagger
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.disable-swagger-default-url=true

# Server
server.port=9090
```

> **Generate a secure JWT secret for production:**
> ```bash
> openssl rand -hex 32
> ```

---

## Commands

### Run the application

```bash
# Standard run
mvn spring-boot:run

# Full clean run (use after package changes or errors)
mvn clean spring-boot:run

# Run as JAR
mvn clean package -DskipTests
java -jar target/ecommerce-0.0.1-SNAPSHOT.jar
```

### Run tests

```bash
# Run all tests
mvn test

# Run all tests with clean build
mvn clean test

# Run a specific test class
mvn test -Dtest=CartServiceTest
mvn test -Dtest=ReviewServiceTest
mvn test -Dtest=ReviewRepositoryTest
mvn test -Dtest=ProductControllerIntegrationTest

# Run a specific test method
mvn test -Dtest=CartServiceTest#addItem_validProduct_addsToCart

# Run only unit tests (service layer)
mvn test -Dtest="CartServiceTest,ReviewServiceTest"

# Run only repository tests
mvn test -Dtest=ReviewRepositoryTest

# Run only integration tests
mvn test -Dtest=ProductControllerIntegrationTest

# Run tests and generate report
mvn clean test surefire-report:report
# Report will be at: target/site/surefire-report.html

# Skip tests during build
mvn clean package -DskipTests
```

### Build

```bash
# Compile only
mvn compile

# Clean target directory
mvn clean

# Package into JAR (runs tests)
mvn clean package

# Package without tests
mvn clean package -DskipTests

# Check dependency tree
mvn dependency:tree
```

### Database

```bash
# Connect to ecommerce database
psql -U postgres -d ecommerce

# List all tables
psql -U postgres -d ecommerce -c "\dt"

# Drop and recreate all tables (dev reset)
psql -U postgres -d ecommerce -c "
DROP TABLE IF EXISTS cart_items, carts, order_items, orders,
                     reviews, products, categories, users CASCADE;
"

# Then restart app with create-drop to rebuild schema
# (set spring.jpa.hibernate.ddl-auto=create-drop temporarily)
```

---

## API Reference

### Swagger UI

```
http://localhost:9090/swagger-ui.html
```

### Full Endpoint Reference

#### Auth — Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, receive JWT token |

#### Products — Public (read) / Admin (write)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | Paginated product list |
| GET | `/api/products?page=0&size=10&sortBy=price&direction=desc` | Public | Paginated + sorted |
| GET | `/api/products/filter` | Public | Filter by category, price, name |
| GET | `/api/products/{id}` | Public | Get product by ID |
| GET | `/api/products/search?name=iphone` | Public | Search by name |
| GET | `/api/products/category/{categoryId}` | Public | Products by category |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/{id}` | Admin | Update product |
| DELETE | `/api/products/{id}` | Admin | Delete product |

**Filter query params:**
```
/api/products/filter?categoryId=1&minPrice=10&maxPrice=500&name=phone&page=0&size=10
```

#### Categories — Public (read) / Admin (write)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/categories` | Public | List all categories |
| GET | `/api/categories/{id}` | Public | Get category by ID |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/{id}` | Admin | Update category |
| DELETE | `/api/categories/{id}` | Admin | Delete category |

#### Orders — Authenticated
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | User | Place an order |
| GET | `/api/orders/{id}` | User | Get order by ID |
| PATCH | `/api/orders/{id}/status?status=SHIPPED` | Admin | Update order status |
| DELETE | `/api/orders/{id}` | Admin | Delete order |

**Order status values:** `PENDING` → `CONFIRMED` → `SHIPPED` → `DELIVERED` → `CANCELLED`

#### Cart — Authenticated
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/cart` | User | Get current cart |
| POST | `/api/cart/items` | User | Add item to cart |
| PATCH | `/api/cart/items/{cartItemId}?quantity=3` | User | Update item quantity |
| DELETE | `/api/cart/items/{cartItemId}` | User | Remove item from cart |
| DELETE | `/api/cart` | User | Clear entire cart |

#### Reviews — Public (read) / User (write) / Admin (delete)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products/{id}/reviews` | Public | Get all reviews for product |
| GET | `/api/products/{id}/reviews/rating` | Public | Get average star rating |
| POST | `/api/products/{id}/reviews` | User | Submit a review |
| PUT | `/api/products/{id}/reviews/{reviewId}` | User | Edit own review |
| DELETE | `/api/products/{id}/reviews/{reviewId}` | User/Admin | Delete review |

#### Users — Admin only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/{id}` | Get user by ID |
| DELETE | `/api/users/{id}` | Delete user |

---

## Authentication

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "Secret1234!"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john",
  "password": "Secret1234!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "john",
  "role": "ROLE_USER"
}
```

### Using the token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### In Swagger UI

1. Click **Authorize 🔒** at the top right
2. Paste your token — without the `Bearer ` prefix
3. Click **Authorize**

---

## Architecture

### Request Flow

```
Client Request
      │
      ▼
JwtAuthFilter          ← extracts + validates Bearer token
      │
      ▼
SecurityFilterChain    ← role-based access rules
      │
      ▼
Controller             ← @Valid request body validation
      │
      ▼
Service                ← business logic, domain rules
      │
      ▼
Repository             ← Spring Data JPA
      │
      ▼
PostgreSQL
```

### Test Strategy

```
Unit Tests (Mockito)
  └── CartServiceTest         — cart add/remove/clear, stock guard
  └── ReviewServiceTest       — create, duplicate guard, ownership, admin delete

Integration Tests (MockMvc + H2)
  └── ProductControllerIntegrationTest — full HTTP lifecycle with auth

Repository Tests (@DataJpaTest + H2)
  └── ReviewRepositoryTest    — custom queries, average rating, uniqueness
```

### Key Design Decisions

**Records for DTOs** — All request and response objects use Java records. Immutable, concise, and serialize cleanly to JSON without extra config.

**Service layer owns business logic** — Controllers validate input and delegate. All domain rules (stock checks, duplicate review guards, cart ownership) live exclusively in services.

**Persistent cart** — Each user has exactly one cart row (`UNIQUE` on `user_id`). Cart items are orphan-removed so deleting from the list is enough — no explicit delete query needed.

**One review per user per product** — Enforced at both the DB level (`UNIQUE` constraint) and service level (`existsByUserIdAndProductId` check before insert).

**`@Transactional` on writes** — Order creation, cart updates, and review writes all use `@Transactional`. If any step fails, the entire operation rolls back.

**H2 for tests** — `application-test.properties` activates an in-memory H2 database for all tests. No real PostgreSQL connection needed to run the test suite.

---

## Database Schema

```sql
-- Core tables
CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   TEXT         NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255)   NOT NULL,
    description TEXT,
    price       NUMERIC(18,2)  NOT NULL CHECK (price > 0),
    stock       INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id INTEGER        REFERENCES categories(id) ON DELETE SET NULL,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP
);

CREATE TABLE orders (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status       VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(18,2) NOT NULL,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER       NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity   INTEGER       NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(18,2) NOT NULL CHECK (unit_price > 0)
);

-- Cart tables
CREATE TABLE carts (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER   NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
    id         SERIAL PRIMARY KEY,
    cart_id    INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

-- Reviews
CREATE TABLE reviews (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER  NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_product_review UNIQUE (user_id, product_id)
);

-- Indexes
CREATE INDEX idx_products_category    ON products (category_id);
CREATE INDEX idx_orders_user          ON orders (user_id);
CREATE INDEX idx_order_items_order    ON order_items (order_id);
CREATE INDEX idx_cart_items_cart      ON cart_items (cart_id);
CREATE INDEX idx_reviews_product      ON reviews (product_id);
```

> Hibernate manages schema automatically via `spring.jpa.hibernate.ddl-auto=update`.
> The SQL above is provided for reference and manual setup.