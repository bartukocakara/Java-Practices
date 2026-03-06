# 🏦 Maven Bank

A command-line banking application built with Java, PostgreSQL, and Maven. Supports multi-currency accounts, real-time exchange rates, fund transfers, and full transaction history — with BCrypt authentication and structured logging throughout.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Usage](#usage)
- [Architecture](#architecture)
- [Testing](#testing)
- [Logging](#logging)

---

## Features

- **Authentication** — Register and login with BCrypt-hashed passwords
- **Multi-currency accounts** — Create CHECKING or SAVINGS accounts in TRY, USD, or EUR
- **Deposits & Withdrawals** — With full domain validation (e.g. insufficient funds)
- **Fund Transfers** — Between users, with currency mismatch protection
- **Transaction History** — Last 10 transactions per account
- **Live Exchange Rates** — Fetched from [exchangerate-api.com](https://www.exchangerate-api.com), cached and refreshed every 24 hours
- **Structured Logging** — Centralized via `LoggingConfig`, written to `banking_system.log`
- **Clean CLI** — Input validation, cancel support, and contextual error messages

---

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Language       | Java 17+                          |
| Build Tool     | Maven                             |
| Database       | PostgreSQL                        |
| JDBC           | Plain JDBC with PreparedStatements|
| Auth           | jBCrypt                           |
| HTTP Client    | Java `HttpClient` (built-in)      |
| JSON Parsing   | Jackson Databind                  |
| Env Config     | dotenv-java                       |
| Logging        | `java.util.logging` (JUL)         |
| Testing        | JUnit 5 + Mockito                 |

---

## Project Structure

```
src/
├── main/java/com/example/
│   ├── App.java                        # Entry point, CLI loop
│   ├── config/
│   │   ├── DatabaseConfig.java         # JDBC connection factory
│   │   └── LoggingConfig.java          # Centralized logger setup
│   ├── model/
│   │   ├── Account.java                # Immutable record with deposit/withdraw
│   │   ├── User.java                   # Immutable user record
│   │   └── ExchangeRate.java           # Rate snapshot record
│   ├── repository/
│   │   ├── AccountRepository.java      # Repository interface
│   │   └── PostgresAccountRepository.java  # JDBC implementation
│   ├── scheduler/
│   │   └── ExchangeRateScheduler.java  # 24-hour background refresh
│   └── service/
│       ├── AuthService.java            # Register & login
│       ├── BankingService.java         # Deposit, withdraw, transfer
│       ├── AccountService.java         # Account creation & listing
│       └── ExchangeRateService.java    # Rate fetching & caching
└── test/java/com/example/
    ├── AccountTest.java
    ├── AppTest.java
    ├── repository/
    │   └── PostgresAccountRepositoryTest.java
    └── service/
        ├── AuthServiceTest.java
        └── BankingServiceTest.java
```

---

## Database Schema

```sql
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE accounts (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(26)    NOT NULL UNIQUE,
    account_type   VARCHAR(10)    NOT NULL CHECK (account_type IN ('CHECKING', 'SAVINGS')),
    balance        NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    currency       CHAR(3)        NOT NULL CHECK (currency IN ('TRY', 'USD', 'EUR')),
    updated_at     TIMESTAMP      NOT NULL DEFAULT NOW(),
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
    id               SERIAL PRIMARY KEY,
    account_id       INTEGER        NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount           NUMERIC(18, 2) NOT NULL,
    transaction_type VARCHAR(20)    NOT NULL,
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE exchange_rates (
    id              SERIAL PRIMARY KEY,
    base_currency   CHAR(3)        NOT NULL,
    target_currency CHAR(3)        NOT NULL,
    rate            NUMERIC(18, 6) NOT NULL,
    fetched_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_currency_pair UNIQUE (base_currency, target_currency)
);

CREATE INDEX idx_exchange_rates_base      ON exchange_rates (base_currency);
CREATE INDEX idx_exchange_rates_fetched_at ON exchange_rates (fetched_at);
```

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 13+

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourname/maven-bank.git
cd maven-bank
```

**2. Create the database**

```bash
psql -U postgres -c "CREATE DATABASE banking;"
psql -U postgres -d banking -f schema.sql
```

**3. Configure environment variables**

Create a `.env` file in the project root (see [Configuration](#configuration)).

**4. Build and run**

```bash
mvn compile exec:java
```

Or package and run:

```bash
mvn package
java -jar target/banking-1.0-SNAPSHOT.jar
```

---

## Configuration

Create a `.env` file in the project root:

```env
# Database
FU_MAIN_DB_HOST=localhost
FU_MAIN_DB_PORT=5432
FU_MAIN_DB_NAME=banking
FU_MAIN_DB_USERNAME=postgres
FU_MAIN_DB_PASSWORD=yourpassword

# Exchange Rate API
# Get a free key at https://www.exchangerate-api.com
EXCHANGE_RATE_API_KEY=your_api_key_here
```

> **Note:** Never commit your `.env` file. It is already listed in `.gitignore`.

---

## Usage

### Authentication

```
=== 🏦 Maven Bank ===

1. Register | 2. Login | 3. Exit
Choice: 1
New Username : bkckr
Email        : bkckr@example.com
Password     : ••••••••
  ✅ Registered! Please log in.
```

### Banking Menu

```
==============================
  👤 bkckr
  💰 Balance: 1000.00
------------------------------
  1. Deposit
  2. Withdraw
  3. Transfer
  4. History
  5. Create Account
  6. Logout
==============================
```

### Creating an Account

```
  --- 🏦 New Account ---
  Account type:
    1. CHECKING
    2. SAVINGS
  Choice: 1
  Currency:
    1. TRY
    2. USD
    3. EUR
  Choice: 2
  ✅ Account created!
     Number  : USD-A1B2C3D4
     Type    : CHECKING
     Currency: USD
```

### Transfer

```
  Transfer to (username): alice
  Transfer amount (or 'cancel'): 250.00
  ✅ Transferred 250.00 to alice. New balance: 750.00
```

> Cross-currency transfers are rejected. Both accounts must share the same currency.

---

## Architecture

### Layered Design

```
App.java  (CLI / Presentation)
    │
    ├── AuthService          — registration, login, BCrypt
    ├── BankingService       — deposit, withdraw, transfer (JDBC transactions)
    ├── AccountService       — account creation, listing
    └── ExchangeRateService  — rate cache, API integration
            │
            └── AccountRepository (interface)
                    │
                    └── PostgresAccountRepository (JDBC impl)
```

### Key Design Decisions

**Immutable `Account` record** — `deposit()` and `withdraw()` return new `Account` instances rather than mutating state. This makes the before/after balance explicit and easy to log and test.

**Repository pattern** — `AccountRepository` is an interface, making all service logic testable without a real database. `PostgresAccountRepository` is the only class that knows about SQL.

**Centralized logging via `LoggingConfig`** — Every class calls `LoggingConfig.getLogger(MyClass.class)` instead of managing its own `FileHandler`. One call to `LoggingConfig.init()` in `main()` configures the entire application.

**Exchange rate caching** — `ExchangeRateService` stores rates in a `ConcurrentHashMap`. One API call fetches all ~170 rates for a base currency at once, staying well within the free tier's monthly limit. The `ExchangeRateScheduler` refreshes only currencies already in the cache every 24 hours.

**JDBC transactions** — `BankingService` uses explicit `conn.setAutoCommit(false)` / `commit()` / `rollback()` blocks to ensure balance updates and transaction logs are always atomic.

---

## Testing

Run all tests:

```bash
mvn test
```

### Test Coverage

| Test Class                         | What it covers                                        |
|------------------------------------|-------------------------------------------------------|
| `AccountTest`                      | `deposit()`, `withdraw()`, insufficient funds guard   |
| `BankingServiceTest`               | Deposit, withdrawal, insufficient funds — mocked DB   |
| `AuthServiceTest`                  | Register, login success/failure                       |
| `PostgresAccountRepositoryTest`    | `createUser`, `createAccount`, `findByUsername`, `updateBalance` |

### Mocking Strategy

- `@Mock` + `MockitoExtension` for repository dependencies
- `MockedStatic<DatabaseConfig>` for intercepting `getConnection()` in service-level tests
- `lenient()` stubs in `@BeforeEach` for shared setup that not every test exercises

---

## Logging

All log output goes to `banking_system.log` in the project root, configured once at startup:

```java
// App.java
LoggingConfig.init();
```

Every service obtains its logger via:

```java
private static final Logger LOGGER = LoggingConfig.getLogger(MyService.class);
```

### Log Levels Used

| Level     | When                                              |
|-----------|---------------------------------------------------|
| `FINE`    | Connection opened, transaction started            |
| `INFO`    | Successful operations, balance changes            |
| `WARNING` | Business rule violations, failed login attempts   |
| `SEVERE`  | DB failures, connection errors, critical init failures |