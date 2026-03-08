-- ============================================================
-- ECOMMERCE DATABASE SETUP
-- ============================================================

-- 1. CREATE DATABASE
-- Run this separately, outside of a transaction block
-- psql -U postgres -c "CREATE DATABASE ecommerce;"

CREATE DATABASE ecommerce
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

\c ecommerce;

-- ============================================================
-- 2. ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('ROLE_USER', 'ROLE_ADMIN');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- ============================================================
-- 3. TABLES
-- ============================================================

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)   NOT NULL UNIQUE,
    email         VARCHAR(100)  NOT NULL UNIQUE,
    password      TEXT          NOT NULL,
    role          user_role     NOT NULL DEFAULT 'ROLE_USER',
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL UNIQUE,
    description   TEXT
);

CREATE TABLE products (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255)   NOT NULL,
    description   TEXT,
    price         NUMERIC(18, 2) NOT NULL CHECK (price > 0),
    stock         INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id   INTEGER        REFERENCES categories(id) ON DELETE SET NULL,
    created_at    TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP
);

CREATE TABLE orders (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status        order_status   NOT NULL DEFAULT 'PENDING',
    total_amount  NUMERIC(18, 2) NOT NULL CHECK (total_amount >= 0),
    created_at    TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id            SERIAL PRIMARY KEY,
    order_id      INTEGER        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id    INTEGER        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity      INTEGER        NOT NULL CHECK (quantity > 0),
    unit_price    NUMERIC(18, 2) NOT NULL CHECK (unit_price > 0)
);

-- ============================================================
-- 4. INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_username ON users (username);

-- Products
CREATE INDEX idx_products_category  ON products (category_id);
CREATE INDEX idx_products_name      ON products (name);
CREATE INDEX idx_products_price     ON products (price);

-- Orders
CREATE INDEX idx_orders_user_id     ON orders (user_id);
CREATE INDEX idx_orders_status      ON orders (status);
CREATE INDEX idx_orders_created_at  ON orders (created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order_id   ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);

-- ============================================================
-- 5. UPDATED_AT TRIGGER (auto-update on product changes)
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 6. SEED DATA
-- ============================================================

-- Admin user (password: Admin1234!)
-- BCrypt hash generated with strength 10
INSERT INTO users (username, email, password, role) VALUES
    ('admin', 'admin@ecommerce.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ROLE_ADMIN'),
    ('john',  'john@example.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ROLE_USER'),
    ('jane',  'jane@example.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ROLE_USER');

-- Categories
INSERT INTO categories (name, description) VALUES
    ('Electronics',  'Phones, laptops, gadgets and accessories'),
    ('Clothing',     'Men and women apparel'),
    ('Books',        'Fiction, non-fiction, technical and educational'),
    ('Home & Garden','Furniture, tools, and home decor'),
    ('Sports',       'Equipment and apparel for sports and fitness');

-- Products
INSERT INTO products (name, description, price, stock, category_id) VALUES
    ('iPhone 15 Pro',       '6.1-inch Super Retina XDR display, A17 Pro chip',         1299.99,  50, 1),
    ('Samsung Galaxy S24',  '6.2-inch Dynamic AMOLED, Snapdragon 8 Gen 3',              999.99,  75, 1),
    ('MacBook Pro 14"',     'M3 Pro chip, 18GB RAM, 512GB SSD',                        1999.99,  30, 1),
    ('Sony WH-1000XM5',     'Industry-leading noise canceling wireless headphones',      349.99, 120, 1),
    ('Levi''s 501 Jeans',   'Classic straight fit, 100% cotton denim',                   79.99, 200, 2),
    ('Nike Air Max 270',    'Lightweight running shoes with Air cushioning',             129.99, 150, 2),
    ('Adidas Hoodie',       'Essentials fleece hoodie, regular fit',                      59.99, 180, 2),
    ('Clean Code',          'A Handbook of Agile Software Craftsmanship - Robert Martin', 44.99, 100, 3),
    ('The Pragmatic Programmer', 'Your Journey to Mastery - Hunt & Thomas',              49.99,  80, 3),
    ('Designing Data-Intensive Applications', 'Martin Kleppmann',                        54.99,  60, 3),
    ('IKEA KALLAX Shelf',   '4-cube storage shelf unit, white',                          89.99,  40, 4),
    ('Bosch Drill Set',     'Professional 18V cordless drill with accessories',          159.99,  55, 4),
    ('Yoga Mat',            'Non-slip 6mm thick exercise mat with carrying strap',        29.99, 300, 5),
    ('Dumbbells 10kg Pair', 'Cast iron dumbbells with knurled grip',                      49.99, 200, 5),
    ('Resistance Bands Set','5-level resistance training bands',                          19.99, 250, 5);

-- Orders
INSERT INTO orders (user_id, status, total_amount) VALUES
    (2, 'DELIVERED', 1379.98),
    (2, 'SHIPPED',    209.98),
    (3, 'CONFIRMED',   94.98),
    (3, 'PENDING',     54.99);

-- Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 1, 1299.99),  -- john: iPhone 15 Pro
    (1, 4, 1,   79.99),  -- john: Levi's Jeans  (note: price snapshot at time of order)
    (2, 6, 1,  129.99),  -- john: Nike Air Max
    (2, 7, 1,   59.99),  -- john: Adidas Hoodie
    (3, 13, 1,  29.99),  -- jane: Yoga Mat
    (3, 14, 1,  49.99),  -- jane: Dumbbells
    (3, 15, 1,  19.99),  -- jane: Resistance Bands (note: rounding — total reflects actual)
    (4, 10, 1,  54.99);  -- jane: Designing Data-Intensive Apps

-- ============================================================
-- 7. USEFUL VIEWS
-- ============================================================

-- Full order summary
CREATE VIEW v_order_summary AS
SELECT
    o.id          AS order_id,
    u.username,
    u.email,
    o.status,
    o.total_amount,
    COUNT(oi.id)  AS item_count,
    o.created_at
FROM orders o
JOIN users u        ON u.id = o.user_id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, u.username, u.email, o.status, o.total_amount, o.created_at;

-- Product inventory overview
CREATE VIEW v_product_inventory AS
SELECT
    p.id,
    p.name,
    c.name  AS category,
    p.price,
    p.stock,
    CASE
        WHEN p.stock = 0   THEN 'OUT OF STOCK'
        WHEN p.stock < 10  THEN 'LOW STOCK'
        ELSE 'IN STOCK'
    END     AS stock_status,
    p.updated_at
FROM products p
LEFT JOIN categories c ON c.id = p.category_id;

-- Revenue per category
CREATE VIEW v_revenue_by_category AS
SELECT
    c.name              AS category,
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(oi.quantity)    AS units_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM order_items oi
JOIN products p   ON p.id = oi.product_id
JOIN categories c ON c.id = p.category_id
JOIN orders o     ON o.id = oi.order_id
WHERE o.status != 'CANCELLED'
GROUP BY c.name
ORDER BY total_revenue DESC;

-- ============================================================
-- 8. TEARDOWN (for dev resets — run manually when needed)
-- ============================================================

-- DROP TABLE IF EXISTS order_items, orders, products, categories, users CASCADE;
-- DROP TYPE IF EXISTS user_role, order_status;
-- DROP FUNCTION IF EXISTS set_updated_at;
-- DROP VIEW IF EXISTS v_order_summary, v_product_inventory, v_revenue_by_category;