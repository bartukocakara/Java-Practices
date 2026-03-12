-- ============================================================
-- ECOMMERCE DATABASE SEED
-- Run with: psql -U postgres -d ecommerce -f seed.sql
-- ============================================================

-- Clean existing data (order matters due to FK constraints)
TRUNCATE TABLE cart_items, carts, order_items, orders,
               reviews, products, categories, users
RESTART IDENTITY CASCADE;

-- ============================================================
-- USERS
-- Passwords are BCrypt hashed — all passwords are: Password1!
-- ============================================================
INSERT INTO users (username, email, password, role, created_at) VALUES
('admin',     'admin@ecommerce.com',   '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_ADMIN', NOW() - INTERVAL '90 days'),
('john',      'john@gmail.com',        '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '80 days'),
('jane',      'jane@gmail.com',        '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '75 days'),
('alice',     'alice@yahoo.com',       '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '70 days'),
('bob',       'bob@yahoo.com',         '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '65 days'),
('charlie',   'charlie@hotmail.com',   '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '60 days'),
('diana',     'diana@hotmail.com',     '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '55 days'),
('eve',       'eve@gmail.com',         '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '50 days'),
('frank',     'frank@gmail.com',       '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '45 days'),
('grace',     'grace@outlook.com',     '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '40 days'),
('henry',     'henry@outlook.com',     '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '35 days'),
('isabella',  'isabella@gmail.com',    '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '30 days'),
('jack',      'jack@gmail.com',        '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '25 days'),
('karen',     'karen@yahoo.com',       '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '20 days'),
('liam',      'liam@yahoo.com',        '$2a$10$g95hsm7c8RvEIyWecq1Ji.btLN9nnK9d6fWcgN1OH9nHA9QDfFqQ.', 'ROLE_USER',  NOW() - INTERVAL '15 days');

-- ============================================================
-- CATEGORIES (with subcategories via parent_id)
-- ============================================================
INSERT INTO categories (name, description, parent_id) VALUES
-- Root categories
('Electronics',    'Electronic devices and accessories',       NULL),  -- id 1
('Clothing',       'Fashion and apparel for all ages',         NULL),  -- id 2
('Home & Garden',  'Everything for your home and garden',      NULL),  -- id 3
('Sports',         'Sports equipment and activewear',          NULL),  -- id 4
('Books',          'Books across all genres',                  NULL),  -- id 5

-- Electronics subcategories
('Smartphones',    'Mobile phones and accessories',            1),     -- id 6
('Laptops',        'Laptops and notebooks',                    1),     -- id 7
('Audio',          'Headphones, speakers, and earbuds',        1),     -- id 8
('Tablets',        'Tablets and e-readers',                    1),     -- id 9

-- Clothing subcategories
('Men''s Clothing','Clothing for men',                         2),     -- id 10
('Women''s Clothing','Clothing for women',                     2),     -- id 11
('Kids'' Clothing', 'Clothing for children',                   2),     -- id 12

-- Home subcategories
('Furniture',      'Tables, chairs, sofas and more',           3),     -- id 13
('Kitchen',        'Kitchen appliances and utensils',          3),     -- id 14

-- Sports subcategories
('Fitness',        'Gym and fitness equipment',                4),     -- id 15
('Outdoor',        'Outdoor and camping gear',                 4),     -- id 16

-- Books subcategories
('Technology',     'Programming and tech books',               5),     -- id 17
('Fiction',        'Novels and fiction',                       5);     -- id 18

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO products (name, description, price, stock, category_id, created_at) VALUES
-- Smartphones (cat 6)
('iPhone 15 Pro',         'Apple iPhone 15 Pro 256GB Space Black',        1299.99,  45,  6, NOW() - INTERVAL '60 days'),
('Samsung Galaxy S24',    'Samsung Galaxy S24 256GB Phantom Black',        999.99,  60,  6, NOW() - INTERVAL '55 days'),
('Google Pixel 8',        'Google Pixel 8 128GB Obsidian',                699.99,  35,  6, NOW() - INTERVAL '50 days'),
('OnePlus 12',            'OnePlus 12 256GB Silky Black',                 799.99,  25,  6, NOW() - INTERVAL '45 days'),

-- Laptops (cat 7)
('MacBook Pro 14"',       'Apple MacBook Pro 14" M3 Pro 512GB',          1999.99,  20,  7, NOW() - INTERVAL '58 days'),
('Dell XPS 15',           'Dell XPS 15 Intel i9 32GB RAM 1TB SSD',       1799.99,  15,  7, NOW() - INTERVAL '52 days'),
('Lenovo ThinkPad X1',    'Lenovo ThinkPad X1 Carbon Gen 11',            1499.99,  18,  7, NOW() - INTERVAL '48 days'),
('ASUS ROG Zephyrus',     'ASUS ROG Zephyrus G14 Gaming Laptop',         1399.99,  12,  7, NOW() - INTERVAL '40 days'),

-- Audio (cat 8)
('Sony WH-1000XM5',       'Sony WH-1000XM5 Wireless Noise Cancelling',    349.99,  80,  8, NOW() - INTERVAL '55 days'),
('AirPods Pro 2',         'Apple AirPods Pro 2nd Generation',             249.99, 100,  8, NOW() - INTERVAL '50 days'),
('Bose QuietComfort 45',  'Bose QuietComfort 45 Wireless Headphones',     329.99,  55,  8, NOW() - INTERVAL '45 days'),
('JBL Charge 5',          'JBL Charge 5 Portable Waterproof Speaker',     179.99,  70,  8, NOW() - INTERVAL '42 days'),

-- Tablets (cat 9)
('iPad Pro 12.9"',        'Apple iPad Pro 12.9" M2 256GB WiFi',          1099.99,  30,  9, NOW() - INTERVAL '50 days'),
('Samsung Galaxy Tab S9', 'Samsung Galaxy Tab S9 Ultra 256GB',            999.99,  25,  9, NOW() - INTERVAL '45 days'),

-- Men's Clothing (cat 10)
('Nike Air Max 270',      'Nike Air Max 270 Running Shoes Size 42',       149.99, 120, 10, NOW() - INTERVAL '60 days'),
('Levi''s 501 Jeans',     'Levi''s 501 Original Fit Jeans Blue W32 L32',  89.99, 200, 10, NOW() - INTERVAL '55 days'),
('Polo Ralph Lauren Shirt','Classic Fit Oxford Shirt Navy Blue',           79.99, 150, 10, NOW() - INTERVAL '50 days'),

-- Women's Clothing (cat 11)
('Zara Floral Dress',     'Zara Floral Print Midi Dress Summer 2024',      59.99, 180, 11, NOW() - INTERVAL '45 days'),
('H&M Blazer',            'H&M Fitted Single-Breasted Blazer Black',       69.99, 130, 11, NOW() - INTERVAL '40 days'),
('Adidas Ultraboost 22',  'Adidas Ultraboost 22 Women''s Running Shoes',  179.99,  90, 11, NOW() - INTERVAL '35 days'),

-- Furniture (cat 13)
('IKEA KALLAX Shelf',     'IKEA KALLAX 4x4 Shelf Unit White',              249.99,  40, 13, NOW() - INTERVAL '55 days'),
('Herman Miller Aeron',   'Herman Miller Aeron Ergonomic Office Chair',  1499.99,   8, 13, NOW() - INTERVAL '50 days'),

-- Kitchen (cat 14)
('Nespresso Vertuo',      'Nespresso Vertuo Next Coffee Machine Black',    149.99,  60, 14, NOW() - INTERVAL '48 days'),
('KitchenAid Mixer',      'KitchenAid Artisan Stand Mixer 4.8L Empire Red', 499.99, 25, 14, NOW() - INTERVAL '45 days'),
('Instant Pot Duo 7',     'Instant Pot Duo 7-in-1 Electric Pressure Cooker', 99.99, 85, 14, NOW() - INTERVAL '40 days'),

-- Fitness (cat 15)
('Bowflex Dumbbells',     'Bowflex SelectTech 552 Adjustable Dumbbells',   399.99,  20, 15, NOW() - INTERVAL '50 days'),
('Yoga Mat Premium',      'Liforme Original Yoga Mat 4.2mm Non-Slip',       99.99,  75, 15, NOW() - INTERVAL '45 days'),
('Resistance Bands Set',  'INTEY Resistance Bands Set 5 Levels',            29.99, 200, 15, NOW() - INTERVAL '40 days'),

-- Technology Books (cat 17)
('Clean Code',            'Clean Code: A Handbook of Agile Software Craftsmanship by Robert C. Martin', 39.99, 120, 17, NOW() - INTERVAL '60 days'),
('Spring in Action',      'Spring in Action 6th Edition by Craig Walls',   49.99,  80, 17, NOW() - INTERVAL '55 days'),
('Designing Data-Intensive','Designing Data-Intensive Applications by Martin Kleppmann', 54.99, 65, 17, NOW() - INTERVAL '50 days'),

-- Fiction (cat 18)
('The Midnight Library',  'The Midnight Library by Matt Haig',             16.99, 150, 18, NOW() - INTERVAL '45 days'),
('Atomic Habits',         'Atomic Habits by James Clear',                  18.99, 200, 18, NOW() - INTERVAL '40 days');

-- ============================================================
-- ORDERS
-- ============================================================
INSERT INTO orders (user_id, status, total_amount, created_at) VALUES
(2,  'DELIVERED',  1649.98, NOW() - INTERVAL '70 days'),  -- id 1  john
(3,  'DELIVERED',   599.98, NOW() - INTERVAL '68 days'),  -- id 2  jane
(4,  'DELIVERED',  2249.98, NOW() - INTERVAL '65 days'),  -- id 3  alice
(5,  'SHIPPED',    1099.99, NOW() - INTERVAL '60 days'),  -- id 4  bob
(6,  'SHIPPED',     449.98, NOW() - INTERVAL '55 days'),  -- id 5  charlie
(7,  'CONFIRMED',   349.99, NOW() - INTERVAL '50 days'),  -- id 6  diana
(8,  'CONFIRMED',   329.97, NOW() - INTERVAL '45 days'),  -- id 7  eve
(9,  'PENDING',    1799.99, NOW() - INTERVAL '40 days'),  -- id 8  frank
(10, 'PENDING',     279.98, NOW() - INTERVAL '35 days'),  -- id 9  grace
(11, 'CANCELLED',   999.99, NOW() - INTERVAL '30 days'),  -- id 10 henry
(2,  'DELIVERED',   499.99, NOW() - INTERVAL '25 days'),  -- id 11 john
(3,  'SHIPPED',     269.98, NOW() - INTERVAL '20 days'),  -- id 12 jane
(4,  'CONFIRMED',   149.99, NOW() - INTERVAL '15 days'),  -- id 13 alice
(12, 'PENDING',    1299.99, NOW() - INTERVAL '10 days'),  -- id 14 isabella
(13, 'PENDING',     218.97, NOW() - INTERVAL '5 days');   -- id 15 jack

-- ============================================================
-- ORDER ITEMS
-- ============================================================
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
-- Order 1: john — MacBook Pro + AirPods
(1, 5,  1, 1999.99),
(1, 10, 1,  249.99),

-- Order 2: jane — Nike shoes + Jeans
(2, 15, 1,  149.99),
(2, 16, 1,   89.99),
(2, 17, 1,   79.99),  -- shirt too, but totals approx

-- Order 3: alice — Dell XPS + Sony headphones
(3, 6,  1, 1799.99),
(3, 9,  1,  349.99),

-- Order 4: bob — iPad Pro
(4, 13, 1, 1099.99),

-- Order 5: charlie — Bose headphones + JBL
(5, 11, 1,  329.99),
(5, 12, 1,  179.99),

-- Order 6: diana — Sony headphones
(6, 9,  1,  349.99),

-- Order 7: eve — 3 books
(7, 29, 1,   39.99),
(7, 30, 1,   49.99),
(7, 31, 1,   54.99),

-- Order 8: frank — Dell XPS
(8, 6,  1, 1799.99),

-- Order 9: grace — Yoga mat + Resistance bands
(9, 27, 1,   99.99),
(9, 28, 2,   29.99),

-- Order 10: henry — Samsung Galaxy (cancelled)
(10, 2, 1,  999.99),

-- Order 11: john — KitchenAid Mixer
(11, 24, 1, 499.99),

-- Order 12: jane — Floral Dress + Blazer
(12, 18, 1,  59.99),
(12, 19, 1,  69.99),
(12, 20, 1,  179.99),

-- Order 13: alice — Nike Air Max
(13, 15, 1,  149.99),

-- Order 14: isabella — iPhone 15 Pro
(14, 1,  1, 1299.99),

-- Order 15: jack — Clean Code + Spring in Action + Atomic Habits
(15, 29, 1,   39.99),
(15, 30, 1,   49.99),
(15, 33, 2,   18.99);

-- ============================================================
-- REVIEWS
-- ============================================================
INSERT INTO reviews (user_id, product_id, rating, comment, created_at) VALUES
-- iPhone 15 Pro reviews
(2,  1, 5, 'Absolutely love this phone! Camera is incredible, battery lasts all day. Worth every penny.', NOW() - INTERVAL '55 days'),
(3,  1, 4, 'Great phone overall. A bit pricey but the build quality is outstanding.', NOW() - INTERVAL '50 days'),
(4,  1, 5, 'Best iPhone yet. The titanium design feels premium and the performance is blazing fast.', NOW() - INTERVAL '45 days'),

-- Samsung Galaxy S24 reviews
(5,  2, 4, 'Excellent Android phone. Display is gorgeous and the AI features are genuinely useful.', NOW() - INTERVAL '50 days'),
(6,  2, 5, 'Switched from iPhone and couldn''t be happier. Camera system is phenomenal.', NOW() - INTERVAL '45 days'),
(7,  2, 3, 'Good phone but gets warm under heavy load. Battery could be better.', NOW() - INTERVAL '40 days'),

-- MacBook Pro reviews
(2,  5, 5, 'M3 Pro chip is a beast. Handles everything I throw at it effortlessly. Best laptop I''ve owned.', NOW() - INTERVAL '60 days'),
(8,  5, 5, 'Battery life is insane — easily 12 hours of real work. The display is stunning.', NOW() - INTERVAL '55 days'),
(9,  5, 4, 'Incredible performance but very expensive. The notch is still annoying in 2024.', NOW() - INTERVAL '48 days'),

-- Dell XPS 15 reviews
(4,  6, 4, 'Great Windows laptop. Display is 4K OLED and absolutely beautiful. Runs hot though.', NOW() - INTERVAL '45 days'),
(10, 6, 3, 'Good specs but the fan noise under load is distracting. Expected better thermal management.', NOW() - INTERVAL '40 days'),

-- Sony WH-1000XM5 reviews
(7,  9, 5, 'Best noise cancellation I''ve ever experienced. Perfect for flights and open offices.', NOW() - INTERVAL '48 days'),
(11, 9, 5, 'Sound quality is exceptional. Comfortable even after 6+ hours of use.', NOW() - INTERVAL '42 days'),
(3,  9, 4, 'Great headphones. ANC is top notch but the new design doesn''t fold flat anymore.', NOW() - INTERVAL '36 days'),

-- AirPods Pro reviews
(2,  10, 5, 'These are my daily drivers. Transparency mode is like having no headphones in. Amazing.', NOW() - INTERVAL '45 days'),
(5,  10, 4, 'Great sound and ANC for the size. Battery case is convenient. A bit overpriced.', NOW() - INTERVAL '38 days'),

-- Nike Air Max 270 reviews
(3,  15, 5, 'Super comfortable for daily wear. The Air unit makes a huge difference.', NOW() - INTERVAL '55 days'),
(6,  15, 4, 'Stylish and comfortable. Runs slightly large so size down half a size.', NOW() - INTERVAL '48 days'),
(13, 15, 5, 'Best running shoes I''ve owned. Very supportive and cushioned.', NOW() - INTERVAL '30 days'),

-- Levi's 501 reviews
(9,  16, 4, 'Classic fit, great quality denim. Washes well and keeps its shape.', NOW() - INTERVAL '50 days'),
(14, 16, 5, 'Best jeans ever. Bought 3 pairs. The quality at this price is unbeatable.', NOW() - INTERVAL '25 days'),

-- KitchenAid Mixer reviews
(2,  24, 5, 'Worth every cent. Makes baking so much easier. Built like a tank — will last forever.', NOW() - INTERVAL '20 days'),
(8,  24, 5, 'Beautiful machine. Powerful motor handles even stiff bread dough with ease.', NOW() - INTERVAL '15 days'),
(10, 24, 4, 'Great mixer but very heavy. Hard to move around the kitchen. Still love it though.', NOW() - INTERVAL '10 days'),

-- Instant Pot reviews
(12, 25, 5, 'Changed how I cook. Makes incredible soups and stews in a fraction of the time.', NOW() - INTERVAL '35 days'),
(7,  25, 4, 'Very versatile. Takes time to learn all the settings but totally worth it.', NOW() - INTERVAL '28 days'),

-- Clean Code reviews
(13, 29, 5, 'Every developer should read this. Changed the way I think about writing code.', NOW() - INTERVAL '55 days'),
(15, 29, 5, 'Timeless classic. The examples are in Java which makes it even more relevant.', NOW() - INTERVAL '45 days'),
(9,  29, 4, 'Great book but some examples feel dated. Still full of valuable insights.', NOW() - INTERVAL '35 days'),

-- Spring in Action reviews
(11, 30, 5, 'Best Spring book out there. Covers everything you need to build real applications.', NOW() - INTERVAL '50 days'),
(15, 30, 4, 'Good coverage of Spring Boot. Would like more on microservices.', NOW() - INTERVAL '30 days'),

-- Bowflex Dumbbells reviews
(6,  26, 5, 'Replaced my entire dumbbell rack. Space saving and incredibly well made.', NOW() - INTERVAL '45 days'),
(14, 26, 4, 'Great product. Adjustment mechanism is smooth. A bit slow to change weights mid-workout.', NOW() - INTERVAL '35 days'),

-- Yoga Mat reviews
(4,  27, 5, 'Best yoga mat on the market. The alignment lines are incredibly helpful.', NOW() - INTERVAL '40 days'),
(8,  27, 5, 'Non-slip surface is excellent even when sweaty. Worth the premium price.', NOW() - INTERVAL '32 days'),
(3,  27, 4, 'Great quality mat. A bit heavy to carry to the studio but perfect for home use.', NOW() - INTERVAL '25 days'),

-- iPad Pro reviews
(5,  13, 5, 'M2 chip makes this feel more like a laptop than a tablet. Stage Manager is brilliant.', NOW() - INTERVAL '55 days'),
(11, 13, 4, 'Amazing display and performance. Very expensive especially with Apple Pencil and keyboard.', NOW() - INTERVAL '45 days');

-- ============================================================
-- CARTS (one per user)
-- ============================================================
INSERT INTO carts (user_id, created_at, updated_at) VALUES
(2,  NOW() - INTERVAL '5 days',  NOW() - INTERVAL '1 day'),   -- john
(3,  NOW() - INTERVAL '4 days',  NOW() - INTERVAL '2 days'),  -- jane
(4,  NOW() - INTERVAL '3 days',  NOW() - INTERVAL '1 day'),   -- alice
(5,  NOW() - INTERVAL '6 days',  NOW() - INTERVAL '3 days'),  -- bob
(6,  NOW() - INTERVAL '2 days',  NOW()),                       -- charlie
(7,  NOW() - INTERVAL '1 day',   NOW()),                       -- diana
(12, NOW() - INTERVAL '3 days',  NOW() - INTERVAL '1 day'),   -- isabella
(13, NOW() - INTERVAL '2 days',  NOW());                       -- jack

-- ============================================================
-- CART ITEMS
-- ============================================================
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
-- john's cart: Pixel 8 + Resistance Bands
(1, 3,  1),
(1, 28, 2),

-- jane's cart: Samsung Galaxy Tab S9 + Atomic Habits
(2, 14, 1),
(2, 33, 1),

-- alice's cart: Lenovo ThinkPad + Nespresso
(3, 7,  1),
(3, 23, 1),

-- bob's cart: JBL Charge + Yoga Mat
(4, 12, 1),
(4, 27, 1),

-- charlie's cart: OnePlus 12
(5, 4,  1),

-- diana's cart: Zara Dress + H&M Blazer
(6, 18, 1),
(6, 19, 2),

-- isabella's cart: MacBook Pro
(7, 5,  1),

-- jack's cart: Designing Data-Intensive + Midnight Library
(8, 31, 1),
(8, 32, 1);

-- ============================================================
-- SUMMARY
-- ============================================================
-- Users:      15 (1 admin, 14 regular)
-- Categories: 18 (5 root + 13 subcategories)
-- Products:   33 across all categories
-- Orders:     15 (mix of all statuses)
-- Order Items:~25
-- Reviews:    35 (mix of ratings 3-5)
-- Carts:       8 active carts
-- Cart Items: 14
-- ============================================================