-- ============================================================
-- ECOMMERCE DATABASE SCHEMA
-- Run with: psql -U postgres -d ecommerce -f schema.sql
-- ============================================================

-- Drop all tables in correct order (FK dependencies)
DROP TABLE IF EXISTS cart_items        CASCADE;
DROP TABLE IF EXISTS carts             CASCADE;
DROP TABLE IF EXISTS order_items       CASCADE;
DROP TABLE IF EXISTS orders            CASCADE;
DROP TABLE IF EXISTS reviews           CASCADE;
DROP TABLE IF EXISTS product_images    CASCADE;
DROP TABLE IF EXISTS products          CASCADE;
DROP TABLE IF EXISTS categories        CASCADE;
DROP TABLE IF EXISTS users             CASCADE;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password      TEXT         NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER'
                               CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN')),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email    ON users(email);

-- ============================================================
-- CATEGORIES (self-referencing tree — unlimited depth)
-- ============================================================
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT uq_category_name_parent UNIQUE (name, parent_id)
);

CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(255)  NOT NULL,
    description    TEXT,
    price          NUMERIC(18,2) NOT NULL CHECK (price > 0),
    stock          INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
    slug           VARCHAR(255)  NOT NULL UNIQUE,
    category_id    INTEGER       REFERENCES categories(id) ON DELETE SET NULL,
    average_rating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    review_count   INTEGER          NOT NULL DEFAULT 0,
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug     ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price    ON products(price);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER      NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url   VARCHAR(255) NOT NULL,
    is_primary  BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status         VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                                 CHECK (status IN ('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED')),
    payment_method VARCHAR(20)   NOT NULL DEFAULT 'CASH_ON_DELIVERY'
                                 CHECK (payment_method IN ('CASH_ON_DELIVERY','CREDIT_CARD')),
    total_amount   NUMERIC(18,2) NOT NULL CHECK (total_amount >= 0),
    full_name      VARCHAR(100),
    phone          VARCHAR(20),
    address_line   VARCHAR(255),
    city           VARCHAR(100),
    country        VARCHAR(100),
    notes          TEXT,
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user       ON orders(user_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
    id           SERIAL PRIMARY KEY,
    order_id     INTEGER       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   INTEGER       NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255)  NOT NULL,
    quantity     INTEGER       NOT NULL CHECK (quantity > 0),
    unit_price   NUMERIC(18,2) NOT NULL CHECK (unit_price > 0)
);

CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER  NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_product_review UNIQUE (user_id, product_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user    ON reviews(user_id);

-- ============================================================
-- CARTS
-- ============================================================
CREATE TABLE carts (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER   NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CART ITEMS
-- ============================================================
CREATE TABLE cart_items (
    id         SERIAL PRIMARY KEY,
    cart_id    INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart    ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- ============================================================
-- SUMMARY
-- tables:  users, categories, products, product_images,
--          orders, order_items, reviews, carts, cart_items
-- ============================================================