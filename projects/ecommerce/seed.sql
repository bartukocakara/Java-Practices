-- ============================================================
-- ECOMMERCE MARKETPLACE — FULL SEED
-- Run AFTER schema.sql:
--   psql -U postgres -d ecommerce -f schema.sql
--   psql -U postgres -d ecommerce -f seed.sql
-- ============================================================

-- ============================================================
-- USERS
-- Password for ALL users: Password1!
-- BCrypt hash generated with Spring's BCryptPasswordEncoder
-- ============================================================
INSERT INTO users (username, email, password, role, created_at) VALUES
('admin',    'admin@ecommerce.com',  '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_ADMIN',  NOW() - INTERVAL '90 days'),
('john',     'john@gmail.com',       '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '80 days'),
('jane',     'jane@gmail.com',       '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '75 days'),
('alice',    'alice@yahoo.com',      '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '70 days'),
('bob',      'bob@yahoo.com',        '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '65 days'),
('charlie',  'charlie@hotmail.com',  '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '60 days'),
('diana',    'diana@hotmail.com',    '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '55 days'),
('eve',      'eve@gmail.com',        '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '50 days'),
('frank',    'frank@gmail.com',      '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '45 days'),
('grace',    'grace@outlook.com',    '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '40 days'),
('henry',    'henry@outlook.com',    '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '35 days'),
('isabella', 'isabella@gmail.com',   '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '30 days'),
('jack',     'jack@gmail.com',       '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '25 days'),
('karen',    'karen@yahoo.com',      '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '20 days'),
('liam',     'liam@yahoo.com',       '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_USER',   NOW() - INTERVAL '15 days'),
-- Vendor users
('techstore',  'tech@techstore.com',   '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_VENDOR', NOW() - INTERVAL '60 days'),
('fashionhub', 'info@fashionhub.com',  '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_VENDOR', NOW() - INTERVAL '55 days'),
('bookworld',  'hello@bookworld.com',  '$2a$10$VNjZtcfAa.lCS6H6wpeRrO2gl.zzJ8MEBCUT/Q3X.jUdU3eAE1nMq', 'ROLE_VENDOR', NOW() - INTERVAL '50 days');

-- ============================================================
-- USER ADDRESSES
-- ============================================================
INSERT INTO user_addresses (user_id, title, full_name, phone, address_line, city, country, is_default) VALUES
(2,  'Home',    'John Smith',    '+1 555 001 0001', '123 Main St Apt 4B',    'New York',    'USA',    TRUE),
(2,  'Work',    'John Smith',    '+1 555 001 0002', '456 Business Ave',      'New York',    'USA',    FALSE),
(3,  'Home',    'Jane Doe',      '+1 555 002 0001', '456 Oak Avenue',        'Los Angeles', 'USA',    TRUE),
(4,  'Home',    'Alice Johnson', '+1 555 003 0001', '789 Pine Road Suite 2', 'Chicago',     'USA',    TRUE),
(5,  'Home',    'Bob Williams',  '+1 555 004 0001', '321 Elm Street',        'Houston',     'USA',    TRUE);

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (id, name, description, parent_id) VALUES
-- Root
(1,  'Electronics',       'Electronic devices and accessories',    NULL),
(2,  'Clothing',          'Fashion and apparel for all ages',       NULL),
(3,  'Home & Garden',     'Everything for your home and garden',    NULL),
(4,  'Sports',            'Sports equipment and activewear',        NULL),
(5,  'Books',             'Books across all genres',                NULL),
-- Electronics
(6,  'Smartphones',       'Mobile phones and accessories',          1),
(7,  'Laptops',           'Laptops and notebooks',                  1),
(8,  'Audio',             'Headphones, speakers, and earbuds',      1),
(9,  'Tablets',           'Tablets and e-readers',                  1),
-- Clothing
(10, 'Men''s Clothing',   'Clothing for men',                       2),
(11, 'Women''s Clothing', 'Clothing for women',                     2),
(12, 'Kids'' Clothing',   'Clothing for children',                  2),
-- Home
(13, 'Furniture',         'Tables, chairs, sofas and more',         3),
(14, 'Kitchen',           'Kitchen appliances and utensils',        3),
-- Sports
(15, 'Fitness',           'Gym and fitness equipment',              4),
(16, 'Outdoor',           'Outdoor and camping gear',               4),
-- Books
(17, 'Technology',        'Programming and tech books',             5),
(18, 'Fiction',           'Novels and fiction',                     5);

SELECT SETVAL('categories_id_seq', 18);

-- ============================================================
-- VENDORS
-- ============================================================
INSERT INTO vendors (id, user_id, store_name, store_slug, description, email, phone, status, commission_rate, total_sales, rating, created_at) VALUES
(1, 16, 'Tech Store',   'tech-store',   'Premium electronics and gadgets at competitive prices.',   'tech@techstore.com',  '+1 800 100 0001', 'ACTIVE', 10.00, 245, 4.7, NOW() - INTERVAL '60 days'),
(2, 17, 'Fashion Hub',  'fashion-hub',  'Trendy clothing and accessories for every style.',          'info@fashionhub.com', '+1 800 200 0002', 'ACTIVE', 10.00, 187, 4.5, NOW() - INTERVAL '55 days'),
(3, 18, 'Book World',   'book-world',   'Your favourite books, from bestsellers to hidden gems.',    'hello@bookworld.com', '+1 800 300 0003', 'ACTIVE', 10.00, 312, 4.8, NOW() - INTERVAL '50 days');

SELECT SETVAL('vendors_id_seq', 3);

-- ============================================================
-- VENDOR APPLICATIONS (historical — already approved)
-- ============================================================
INSERT INTO vendor_applications (user_id, store_name, store_slug, description, email, phone, status, admin_note, created_at, reviewed_at, reviewed_by) VALUES
(16, 'Tech Store',  'tech-store',  'Premium electronics and gadgets.',  'tech@techstore.com',  '+1 800 100 0001', 'APPROVED', 'Great store concept, approved.', NOW() - INTERVAL '62 days', NOW() - INTERVAL '60 days', 1),
(17, 'Fashion Hub', 'fashion-hub', 'Trendy clothing and accessories.',  'info@fashionhub.com', '+1 800 200 0002', 'APPROVED', 'Solid fashion brand, approved.', NOW() - INTERVAL '57 days', NOW() - INTERVAL '55 days', 1),
(18, 'Book World',  'book-world',  'Books from bestsellers to gems.',   'hello@bookworld.com', '+1 800 300 0003', 'APPROVED', 'Strong book selection, approved.',NOW() - INTERVAL '52 days', NOW() - INTERVAL '50 days', 1);

-- ============================================================
-- VARIATION ATTRIBUTES
-- ============================================================
INSERT INTO variation_attributes (id, name) VALUES
(1, 'Size'),
(2, 'Color'),
(3, 'Storage'),
(4, 'RAM');

SELECT SETVAL('variation_attributes_id_seq', 4);

INSERT INTO variation_attribute_values (id, attribute_id, value) VALUES
-- Size: clothing
(1,  1, 'XS'), (2,  1, 'S'),  (3,  1, 'M'),   (4,  1, 'L'),   (5,  1, 'XL'),  (6,  1, 'XXL'),
-- Size: shoes
(7,  1, '38'), (8,  1, '39'), (9,  1, '40'),  (10, 1, '41'),  (11, 1, '42'),  (12, 1, '43'), (13, 1, '44'),
-- Color
(14, 2, 'Black'),  (15, 2, 'White'),  (16, 2, 'Red'),
(17, 2, 'Blue'),   (18, 2, 'Navy'),   (19, 2, 'Gray'),
(20, 2, 'Green'),  (21, 2, 'Pink'),
-- Storage
(22, 3, '64GB'),  (23, 3, '128GB'), (24, 3, '256GB'),
(25, 3, '512GB'), (26, 3, '1TB'),
-- RAM
(27, 4, '8GB'),  (28, 4, '16GB'), (29, 4, '32GB');

SELECT SETVAL('variation_attribute_values_id_seq', 29);

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO products (id, name, description, price, base_price, stock, slug, category_id, vendor_id, status, average_rating, review_count, created_at, updated_at) VALUES
-- Smartphones — Tech Store
(1,  'iPhone 15 Pro',         'Apple iPhone 15 Pro — titanium design, A17 Pro chip, 48MP camera system.',              1299.99, 1099.99,   0, 'iphone-15-pro-1',            6,  1, 'ACTIVE', 4.7, 3, NOW() - INTERVAL '60 days', NOW()),
(2,  'Samsung Galaxy S24',    'Samsung Galaxy S24 — Galaxy AI, 200MP camera, Snapdragon 8 Gen 3.',                      999.99,  799.99,   0, 'samsung-galaxy-s24-2',       6,  1, 'ACTIVE', 4.0, 3, NOW() - INTERVAL '55 days', NOW()),
(3,  'Google Pixel 8',        'Google Pixel 8 — best-in-class AI photography, pure Android experience.',                699.99,  699.99,  35, 'google-pixel-8-3',           6,  1, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '50 days', NOW()),
(4,  'OnePlus 12',            'OnePlus 12 — Hasselblad camera, 100W SUPERVOOC charging, Snapdragon 8 Gen 3.',           799.99,  799.99,  25, 'oneplus-12-4',               6,  1, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '45 days', NOW()),
-- Laptops — Tech Store
(5,  'MacBook Pro 14"',       'Apple MacBook Pro 14" — M3 Pro chip, 18-hour battery, Liquid Retina XDR display.',      1999.99, 1999.99,  20, 'macbook-pro-14-5',           7,  1, 'ACTIVE', 4.7, 3, NOW() - INTERVAL '58 days', NOW()),
(6,  'Dell XPS 15',           'Dell XPS 15 — Intel Core i9, 32GB RAM, 1TB SSD, 4K OLED touchscreen.',                 1799.99, 1799.99,  15, 'dell-xps-15-6',              7,  1, 'ACTIVE', 3.5, 2, NOW() - INTERVAL '52 days', NOW()),
(7,  'Lenovo ThinkPad X1',    'Lenovo ThinkPad X1 Carbon Gen 11 — MIL-SPEC tested, 12th Gen Intel Core.',              1499.99, 1499.99,  18, 'lenovo-thinkpad-x1-7',       7,  1, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '48 days', NOW()),
(8,  'ASUS ROG Zephyrus',     'ASUS ROG Zephyrus G14 — AMD Ryzen 9, RTX 4060, 165Hz QHD display.',                    1399.99, 1399.99,  12, 'asus-rog-zephyrus-8',        7,  1, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '40 days', NOW()),
-- Audio — Tech Store
(9,  'Sony WH-1000XM5',       'Sony WH-1000XM5 — industry-leading noise cancellation, 30-hour battery.',                349.99,  349.99,  80, 'sony-wh-1000xm5-9',          8,  1, 'ACTIVE', 4.7, 3, NOW() - INTERVAL '55 days', NOW()),
(10, 'AirPods Pro 2',         'Apple AirPods Pro 2nd Gen — Active Noise Cancellation, Adaptive Audio.',                 249.99,  249.99, 100, 'airpods-pro-2-10',           8,  1, 'ACTIVE', 4.5, 2, NOW() - INTERVAL '50 days', NOW()),
(11, 'Bose QuietComfort 45',  'Bose QuietComfort 45 — world-class noise cancellation, 24-hour battery.',                329.99,  329.99,  55, 'bose-quietcomfort-45-11',    8,  1, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '45 days', NOW()),
(12, 'JBL Charge 5',          'JBL Charge 5 — IP67 waterproof, PartyBoost, 20-hour playtime.',                          179.99,  179.99,  70, 'jbl-charge-5-12',            8,  1, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '42 days', NOW()),
-- Tablets — Tech Store
(13, 'iPad Pro 12.9"',        'Apple iPad Pro 12.9" — M2 chip, Liquid Retina XDR, Thunderbolt port.',                  1099.99, 1099.99,  30, 'ipad-pro-12-9-13',           9,  1, 'ACTIVE', 4.5, 2, NOW() - INTERVAL '50 days', NOW()),
(14, 'Samsung Galaxy Tab S9', 'Samsung Galaxy Tab S9 Ultra — Dynamic AMOLED 2X, S Pen included.',                       999.99,  999.99,  25, 'samsung-galaxy-tab-s9-14',   9,  1, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '45 days', NOW()),
-- Men''s Clothing — Fashion Hub
(15, 'Nike Air Max 270',      'Nike Air Max 270 — Max Air heel unit, engineered mesh upper, all-day comfort.',           149.99,  149.99,   0, 'nike-air-max-270-15',        10, 2, 'ACTIVE', 4.7, 3, NOW() - INTERVAL '60 days', NOW()),
(16, 'Levis 501 Jeans',       'Levi''s 501 Original Fit — the original straight jeans since 1873.',                      89.99,   89.99,   0, 'levis-501-jeans-16',         10, 2, 'ACTIVE', 4.5, 2, NOW() - INTERVAL '55 days', NOW()),
(17, 'Polo Ralph Lauren',     'Polo Ralph Lauren Classic Fit Oxford Shirt — premium cotton, button-down collar.',         79.99,   79.99, 150, 'polo-ralph-lauren-shirt-17', 10, 2, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '50 days', NOW()),
-- Women''s Clothing — Fashion Hub
(18, 'Zara Floral Dress',     'Zara Floral Print Midi Dress — flowing silhouette, vibrant print, summer 2024.',           59.99,   59.99, 180, 'zara-floral-dress-18',       11, 2, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '45 days', NOW()),
(19, 'H&M Blazer',            'H&M Fitted Single-Breasted Blazer — tailored fit, premium fabric, versatile.',             69.99,   69.99, 130, 'hm-blazer-19',               11, 2, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '40 days', NOW()),
(20, 'Adidas Ultraboost 22',  'Adidas Ultraboost 22 — responsive BOOST cushioning, Primeknit+ upper.',                   179.99,  149.99,   0, 'adidas-ultraboost-22-20',    11, 2, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '35 days', NOW()),
-- Furniture — no vendor (platform product)
(21, 'IKEA KALLAX Shelf',     'IKEA KALLAX 4x4 Shelf Unit — versatile storage solution, white.',                          249.99,  249.99,  40, 'ikea-kallax-shelf-21',       13, NULL, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '55 days', NOW()),
(22, 'Herman Miller Aeron',   'Herman Miller Aeron — PostureFit SL, 8Z Pellicle mesh, fully adjustable.',               1499.99, 1499.99,   8, 'herman-miller-aeron-22',     13, NULL, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '50 days', NOW()),
-- Kitchen — no vendor
(23, 'Nespresso Vertuo',      'Nespresso Vertuo Next — Centrifusion technology, 5 cup sizes, recyclable pods.',           149.99,  149.99,  60, 'nespresso-vertuo-23',        14, NULL, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '48 days', NOW()),
(24, 'KitchenAid Mixer',      'KitchenAid Artisan Stand Mixer — 4.8L bowl, 10 speeds, 59 attachments compatible.',        499.99,  499.99,  25, 'kitchenaid-mixer-24',        14, NULL, 'ACTIVE', 4.7, 3, NOW() - INTERVAL '45 days', NOW()),
(25, 'Instant Pot Duo 7',     'Instant Pot Duo 7-in-1 — pressure cooker, slow cooker, rice cooker and more.',              99.99,   99.99,  85, 'instant-pot-duo-7-25',       14, NULL, 'ACTIVE', 4.5, 2, NOW() - INTERVAL '40 days', NOW()),
-- Fitness — no vendor
(26, 'Bowflex Dumbbells',     'Bowflex SelectTech 552 — replaces 15 sets of weights, 2–24kg range.',                      399.99,  399.99,  20, 'bowflex-dumbbells-26',       15, NULL, 'ACTIVE', 4.5, 2, NOW() - INTERVAL '50 days', NOW()),
(27, 'Yoga Mat Premium',      'Liforme Original Yoga Mat — patented AlignForMe system, non-slip GripForMe surface.',        99.99,   99.99,  75, 'yoga-mat-premium-27',        15, NULL, 'ACTIVE', 4.7, 3, NOW() - INTERVAL '45 days', NOW()),
(28, 'Resistance Bands Set',  'INTEY Resistance Bands — 5 resistance levels, natural latex, includes door anchor.',         29.99,   29.99, 200, 'resistance-bands-set-28',    15, NULL, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '40 days', NOW()),
-- Books — Book World
(29, 'Clean Code',            'Clean Code by Robert C. Martin — A Handbook of Agile Software Craftsmanship.',               39.99,   39.99, 120, 'clean-code-29',              17, 3, 'ACTIVE', 4.7, 3, NOW() - INTERVAL '60 days', NOW()),
(30, 'Spring in Action',      'Spring in Action 6th Edition by Craig Walls — comprehensive Spring Boot guide.',              49.99,   49.99,  80, 'spring-in-action-30',        17, 3, 'ACTIVE', 4.5, 2, NOW() - INTERVAL '55 days', NOW()),
(31, 'Designing Data-Intensive Applications', 'Designing Data-Intensive Applications by Martin Kleppmann.',                  54.99,   54.99,  65, 'designing-data-intensive-31',17, 3, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '50 days', NOW()),
(32, 'The Midnight Library',  'The Midnight Library by Matt Haig — a library between life and death.',                       16.99,   16.99, 150, 'the-midnight-library-32',    18, 3, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '45 days', NOW()),
(33, 'Atomic Habits',         'Atomic Habits by James Clear — tiny changes, remarkable results.',                            18.99,   18.99, 200, 'atomic-habits-33',           18, 3, 'ACTIVE', 0.0, 0, NOW() - INTERVAL '40 days', NOW());

SELECT SETVAL('products_id_seq', 33);

-- ============================================================
-- PRODUCT VARIANTS
-- iPhone 15 Pro: 128GB/256GB/512GB × Black/White
-- Samsung Galaxy S24: 256GB/512GB × Black/Gray
-- MacBook Pro: 512GB/1TB × 16GB/32GB RAM
-- Nike Air Max 270: sizes 40-44 × Black/White
-- Levis 501: W30/W32/W34 × sizes
-- Adidas Ultraboost 22: sizes 37-42
-- ============================================================

-- iPhone 15 Pro variants (product 1)
INSERT INTO product_variants (id, product_id, sku, price, stock, is_active) VALUES
(1,  1, 'IPH15PRO-128-BLK', 1099.99,  15, TRUE),
(2,  1, 'IPH15PRO-256-BLK', 1299.99,  20, TRUE),
(3,  1, 'IPH15PRO-512-BLK', 1499.99,  10, TRUE),
(4,  1, 'IPH15PRO-128-WHT', 1099.99,   8, TRUE),
(5,  1, 'IPH15PRO-256-WHT', 1299.99,  12, TRUE),
(6,  1, 'IPH15PRO-512-WHT', 1499.99,   5, TRUE);

-- Samsung Galaxy S24 variants (product 2)
INSERT INTO product_variants (id, product_id, sku, price, stock, is_active) VALUES
(7,  2, 'SAM-S24-256-BLK',  799.99,  25, TRUE),
(8,  2, 'SAM-S24-512-BLK',  999.99,  15, TRUE),
(9,  2, 'SAM-S24-256-GRY',  799.99,  20, TRUE),
(10, 2, 'SAM-S24-512-GRY',  999.99,  10, TRUE);

-- MacBook Pro 14" variants (product 5)
INSERT INTO product_variants (id, product_id, sku, price, stock, is_active) VALUES
(11, 5, 'MBP14-16-512',    1999.99,  10, TRUE),
(12, 5, 'MBP14-16-1TB',    2199.99,   8, TRUE),
(13, 5, 'MBP14-32-512',    2399.99,   5, TRUE),
(14, 5, 'MBP14-32-1TB',    2599.99,   3, TRUE);

-- Nike Air Max 270 variants (product 15)
INSERT INTO product_variants (id, product_id, sku, price, stock, is_active) VALUES
(15, 15, 'NIKE-AM270-40-BLK', 149.99,  20, TRUE),
(16, 15, 'NIKE-AM270-41-BLK', 149.99,  25, TRUE),
(17, 15, 'NIKE-AM270-42-BLK', 149.99,  30, TRUE),
(18, 15, 'NIKE-AM270-43-BLK', 149.99,  20, TRUE),
(19, 15, 'NIKE-AM270-44-BLK', 149.99,  15, TRUE),
(20, 15, 'NIKE-AM270-40-WHT', 149.99,  15, TRUE),
(21, 15, 'NIKE-AM270-41-WHT', 149.99,  18, TRUE),
(22, 15, 'NIKE-AM270-42-WHT', 149.99,  22, TRUE),
(23, 15, 'NIKE-AM270-43-WHT', 149.99,  12, TRUE),
(24, 15, 'NIKE-AM270-44-WHT', 149.99,   8, TRUE);

-- Levis 501 variants (product 16)
INSERT INTO product_variants (id, product_id, sku, price, stock, is_active) VALUES
(25, 16, 'LEVI-501-S-BLU',  89.99,  40, TRUE),
(26, 16, 'LEVI-501-M-BLU',  89.99,  50, TRUE),
(27, 16, 'LEVI-501-L-BLU',  89.99,  45, TRUE),
(28, 16, 'LEVI-501-XL-BLU', 89.99,  30, TRUE),
(29, 16, 'LEVI-501-S-BLK',  89.99,  35, TRUE),
(30, 16, 'LEVI-501-M-BLK',  89.99,  40, TRUE),
(31, 16, 'LEVI-501-L-BLK',  89.99,  38, TRUE),
(32, 16, 'LEVI-501-XL-BLK', 89.99,  25, TRUE);

-- Adidas Ultraboost 22 variants (product 20)
INSERT INTO product_variants (id, product_id, sku, price, stock, is_active) VALUES
(33, 20, 'ADIDAS-UB22-38-BLK', 149.99, 15, TRUE),
(34, 20, 'ADIDAS-UB22-39-BLK', 149.99, 18, TRUE),
(35, 20, 'ADIDAS-UB22-40-BLK', 149.99, 22, TRUE),
(36, 20, 'ADIDAS-UB22-41-BLK', 149.99, 20, TRUE),
(37, 20, 'ADIDAS-UB22-38-WHT', 179.99, 10, TRUE),
(38, 20, 'ADIDAS-UB22-39-WHT', 179.99, 12, TRUE),
(39, 20, 'ADIDAS-UB22-40-WHT', 179.99, 15, TRUE),
(40, 20, 'ADIDAS-UB22-41-WHT', 179.99, 10, TRUE);

SELECT SETVAL('product_variants_id_seq', 40);

-- Variant attribute values (Storage for iPhones)
INSERT INTO variant_attribute_values (variant_id, attribute_id, value_id) VALUES
-- iPhone 128GB Black
(1, 3, 23), (1, 2, 14),
-- iPhone 256GB Black
(2, 3, 24), (2, 2, 14),
-- iPhone 512GB Black
(3, 3, 25), (3, 2, 14),
-- iPhone 128GB White
(4, 3, 23), (4, 2, 15),
-- iPhone 256GB White
(5, 3, 24), (5, 2, 15),
-- iPhone 512GB White
(6, 3, 25), (6, 2, 15),
-- Samsung 256GB Black
(7, 3, 24), (7, 2, 14),
-- Samsung 512GB Black
(8, 3, 25), (8, 2, 14),
-- Samsung 256GB Gray
(9, 3, 24), (9, 2, 19),
-- Samsung 512GB Gray
(10, 3, 25), (10, 2, 19),
-- MacBook 16GB/512GB
(11, 4, 28), (11, 3, 25),
-- MacBook 16GB/1TB
(12, 4, 28), (12, 3, 26),
-- MacBook 32GB/512GB
(13, 4, 29), (13, 3, 25),
-- MacBook 32GB/1TB
(14, 4, 29), (14, 3, 26),
-- Nike Air Max size 40 Black
(15, 1, 9),  (15, 2, 14),
(16, 1, 10), (16, 2, 14),
(17, 1, 11), (17, 2, 14),
(18, 1, 12), (18, 2, 14),
(19, 1, 13), (19, 2, 14),
(20, 1, 9),  (20, 2, 15),
(21, 1, 10), (21, 2, 15),
(22, 1, 11), (22, 2, 15),
(23, 1, 12), (23, 2, 15),
(24, 1, 13), (24, 2, 15),
-- Levis 501 variants
(25, 1, 2),  (25, 2, 17),
(26, 1, 3),  (26, 2, 17),
(27, 1, 4),  (27, 2, 17),
(28, 1, 5),  (28, 2, 17),
(29, 1, 2),  (29, 2, 14),
(30, 1, 3),  (30, 2, 14),
(31, 1, 4),  (31, 2, 14),
(32, 1, 5),  (32, 2, 14),
-- Adidas variants
(33, 1, 7),  (33, 2, 14),
(34, 1, 8),  (34, 2, 14),
(35, 1, 9),  (35, 2, 14),
(36, 1, 10), (36, 2, 14),
(37, 1, 7),  (37, 2, 15),
(38, 1, 8),  (38, 2, 15),
(39, 1, 9),  (39, 2, 15),
(40, 1, 10), (40, 2, 15);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
(1,  '/api/images/products/product_1_iphone_15_pro.jpg',            TRUE, 0),
(2,  '/api/images/products/product_2_samsung_galaxy_s24.jpg',       TRUE, 0),
(3,  '/api/images/products/product_3_google_pixel_8.jpg',           TRUE, 0),
(4,  '/api/images/products/product_4_oneplus_12.jpg',               TRUE, 0),
(5,  '/api/images/products/product_5_macbook_pro_14.jpg',           TRUE, 0),
(6,  '/api/images/products/product_6_dell_xps_15.jpg',              TRUE, 0),
(7,  '/api/images/products/product_7_lenovo_thinkpad_x1.jpg',       TRUE, 0),
(8,  '/api/images/products/product_8_asus_rog_zephyrus.jpg',        TRUE, 0),
(9,  '/api/images/products/product_9_sony_wh-1000xm5.jpg',          TRUE, 0),
(10, '/api/images/products/product_10_airpods_pro_2.jpg',           TRUE, 0),
(11, '/api/images/products/product_11_bose_qc45.jpg',               TRUE, 0),
(12, '/api/images/products/product_12_jbl_charge_5.jpg',            TRUE, 0),
(13, '/api/images/products/product_13_ipad_pro_12.9.jpg',           TRUE, 0),
(14, '/api/images/products/product_14_samsung_galaxy_tab_s9.jpg',   TRUE, 0),
(15, '/api/images/products/product_15_nike_air_max_270.jpg',        TRUE, 0),
(16, '/api/images/products/product_16_levis_501_jeans.jpg',         TRUE, 0),
(17, '/api/images/products/product_17_polo_ralph_lauren.jpg',       TRUE, 0),
(18, '/api/images/products/product_18_zara_floral_dress.jpg',       TRUE, 0),
(19, '/api/images/products/product_19_handm_blazer.jpg',            TRUE, 0),
(20, '/api/images/products/product_20_adidas_ultraboost_22.jpg',    TRUE, 0),
(21, '/api/images/products/product_21_ikea_kallax_shelf.jpg',       TRUE, 0),
(22, '/api/images/products/product_22_herman_miller_aeron.jpg',     TRUE, 0),
(23, '/api/images/products/product_23_nespresso_vertuo.jpg',        TRUE, 0),
(24, '/api/images/products/product_24_kitchenaid_mixer.jpg',        TRUE, 0),
(25, '/api/images/products/product_25_instant_pot_duo_7.jpg',       TRUE, 0),
(26, '/api/images/products/product_26_bowflex_dumbbells.jpg',       TRUE, 0),
(27, '/api/images/products/product_27_yoga_mat_premium.jpg',        TRUE, 0),
(28, '/api/images/products/product_28_resistance_bands_set.jpg',    TRUE, 0),
(29, '/api/images/products/product_29_clean_code.jpg',              TRUE, 0),
(30, '/api/images/products/product_30_spring_in_action.jpg',        TRUE, 0),
(31, '/api/images/products/product_31_designing_data-intensive.jpg',TRUE, 0),
(32, '/api/images/products/product_32_the_midnight_library.jpg',    TRUE, 0),
(33, '/api/images/products/product_33_atomic_habits.jpg',           TRUE, 0);

-- ============================================================
-- ORDERS
-- ============================================================
INSERT INTO orders (id, user_id, status, payment_method, total_amount, full_name, phone, address_line, city, country, notes, created_at) VALUES
(1,  2,  'DELIVERED', 'CREDIT_CARD',      2249.98, 'John Smith',      '+1 555 001 0001', '123 Main St Apt 4B',    'New York',     'USA', NULL,                 NOW() - INTERVAL '70 days'),
(2,  3,  'DELIVERED', 'CASH_ON_DELIVERY',  319.97, 'Jane Doe',        '+1 555 002 0001', '456 Oak Avenue',        'Los Angeles',  'USA', NULL,                 NOW() - INTERVAL '68 days'),
(3,  4,  'DELIVERED', 'CREDIT_CARD',      2149.98, 'Alice Johnson',   '+1 555 003 0001', '789 Pine Road Suite 2', 'Chicago',      'USA', 'Leave at the door',  NOW() - INTERVAL '65 days'),
(4,  5,  'SHIPPED',   'CREDIT_CARD',      1099.99, 'Bob Williams',    '+1 555 004 0001', '321 Elm Street',        'Houston',      'USA', NULL,                 NOW() - INTERVAL '60 days'),
(5,  6,  'SHIPPED',   'CASH_ON_DELIVERY',  509.98, 'Charlie Brown',   '+1 555 005 0001', '654 Maple Drive',       'Phoenix',      'USA', NULL,                 NOW() - INTERVAL '55 days'),
(6,  7,  'CONFIRMED', 'CREDIT_CARD',       349.99, 'Diana Prince',    '+1 555 006 0001', '987 Cedar Lane',        'Philadelphia', 'USA', NULL,                 NOW() - INTERVAL '50 days'),
(7,  8,  'CONFIRMED', 'CASH_ON_DELIVERY',  144.97, 'Eve Wilson',      '+1 555 007 0001', '147 Birch Boulevard',   'San Antonio',  'USA', 'Ring doorbell twice',NOW() - INTERVAL '45 days'),
(8,  9,  'PENDING',   'CREDIT_CARD',      1799.99, 'Frank Miller',    '+1 555 008 0001', '258 Walnut Court',      'San Diego',    'USA', NULL,                 NOW() - INTERVAL '40 days'),
(9,  10, 'PENDING',   'CASH_ON_DELIVERY',  159.97, 'Grace Lee',       '+1 555 009 0001', '369 Spruce Way',        'Dallas',       'USA', NULL,                 NOW() - INTERVAL '35 days'),
(10, 11, 'CANCELLED', 'CREDIT_CARD',       999.99, 'Henry Davis',     '+1 555 010 0001', '741 Aspen Circle',      'San Jose',     'USA', NULL,                 NOW() - INTERVAL '30 days'),
(11, 2,  'DELIVERED', 'CREDIT_CARD',       499.99, 'John Smith',      '+1 555 001 0001', '123 Main St Apt 4B',    'New York',     'USA', NULL,                 NOW() - INTERVAL '25 days'),
(12, 3,  'SHIPPED',   'CASH_ON_DELIVERY',  309.97, 'Jane Doe',        '+1 555 002 0001', '456 Oak Avenue',        'Los Angeles',  'USA', NULL,                 NOW() - INTERVAL '20 days'),
(13, 4,  'CONFIRMED', 'CREDIT_CARD',       149.99, 'Alice Johnson',   '+1 555 003 0001', '789 Pine Road Suite 2', 'Chicago',      'USA', NULL,                 NOW() - INTERVAL '15 days'),
(14, 12, 'PENDING',   'CASH_ON_DELIVERY', 1299.99, 'Isabella Garcia', '+1 555 012 0001', '852 Cypress Street',    'Austin',       'USA', NULL,                 NOW() - INTERVAL '10 days'),
(15, 13, 'PENDING',   'CREDIT_CARD',       127.96, 'Jack Martinez',   '+1 555 013 0001', '963 Magnolia Road',     'Jacksonville', 'USA', 'Fragile items',     NOW() - INTERVAL '5 days');

SELECT SETVAL('orders_id_seq', 15);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_info, quantity, unit_price) VALUES
(1,  5,  12, 'MacBook Pro 14"',         '{"Storage":"1TB","RAM":"16GB"}',   1, 1999.99),
(1,  10, NULL,'AirPods Pro 2',           NULL,                               1,  249.99),
(2,  15, 17, 'Nike Air Max 270',         '{"Size":"42","Color":"Black"}',    1,  149.99),
(2,  16, 26, 'Levis 501 Jeans',          '{"Size":"M","Color":"Blue"}',      1,   89.99),
(2,  17, NULL,'Polo Ralph Lauren Shirt', NULL,                               1,   79.99),
(3,  6,  NULL,'Dell XPS 15',             NULL,                               1, 1799.99),
(3,  9,  NULL,'Sony WH-1000XM5',         NULL,                               1,  349.99),
(4,  13, NULL,'iPad Pro 12.9"',          NULL,                               1, 1099.99),
(5,  11, NULL,'Bose QuietComfort 45',    NULL,                               1,  329.99),
(5,  12, NULL,'JBL Charge 5',            NULL,                               1,  179.99),
(6,  9,  NULL,'Sony WH-1000XM5',         NULL,                               1,  349.99),
(7,  29, NULL,'Clean Code',              NULL,                               1,   39.99),
(7,  30, NULL,'Spring in Action',        NULL,                               1,   49.99),
(7,  31, NULL,'Designing Data-Intensive',NULL,                               1,   54.99),
(8,  6,  NULL,'Dell XPS 15',             NULL,                               1, 1799.99),
(9,  27, NULL,'Yoga Mat Premium',        NULL,                               1,   99.99),
(9,  28, NULL,'Resistance Bands Set',    NULL,                               2,   29.99),
(10, 2,  7,  'Samsung Galaxy S24',       '{"Storage":"256GB","Color":"Black"}',1, 999.99),
(11, 24, NULL,'KitchenAid Mixer',        NULL,                               1,  499.99),
(12, 18, NULL,'Zara Floral Dress',       NULL,                               1,   59.99),
(12, 19, NULL,'H&M Blazer',              NULL,                               1,   69.99),
(12, 20, 35, 'Adidas Ultraboost 22',     '{"Size":"40","Color":"Black"}',    1,  179.99),
(13, 15, 17, 'Nike Air Max 270',         '{"Size":"42","Color":"Black"}',    1,  149.99),
(14, 1,  2,  'iPhone 15 Pro',            '{"Storage":"256GB","Color":"Black"}',1,1299.99),
(15, 29, NULL,'Clean Code',              NULL,                               1,   39.99),
(15, 30, NULL,'Spring in Action',        NULL,                               1,   49.99),
(15, 33, NULL,'Atomic Habits',           NULL,                               2,   18.99);

-- ============================================================
-- REVIEWS
-- ============================================================
INSERT INTO reviews (user_id, product_id, rating, comment, created_at) VALUES
(2,  1,  5, 'Absolutely love this phone! Camera is incredible, battery lasts all day.',              NOW() - INTERVAL '55 days'),
(3,  1,  4, 'Great phone overall. A bit pricey but the build quality is outstanding.',               NOW() - INTERVAL '50 days'),
(4,  1,  5, 'Best iPhone yet. Titanium design feels premium and performance is blazing fast.',        NOW() - INTERVAL '45 days'),
(5,  2,  4, 'Excellent Android phone. Display is gorgeous and AI features are genuinely useful.',    NOW() - INTERVAL '50 days'),
(6,  2,  5, 'Switched from iPhone and could not be happier. Camera system is phenomenal.',           NOW() - INTERVAL '45 days'),
(7,  2,  3, 'Good phone but gets warm under heavy load. Battery could be better.',                   NOW() - INTERVAL '40 days'),
(2,  5,  5, 'M3 Pro chip is a beast. Handles everything I throw at it effortlessly.',                NOW() - INTERVAL '60 days'),
(8,  5,  5, 'Battery life is insane, easily 12 hours of real work. The display is stunning.',        NOW() - INTERVAL '55 days'),
(9,  5,  4, 'Incredible performance but very expensive. The notch is still annoying in 2024.',       NOW() - INTERVAL '48 days'),
(4,  6,  4, 'Great Windows laptop. Display is 4K OLED and absolutely beautiful. Runs hot though.',  NOW() - INTERVAL '45 days'),
(10, 6,  3, 'Good specs but the fan noise under load is distracting.',                              NOW() - INTERVAL '40 days'),
(7,  9,  5, 'Best noise cancellation I have ever experienced. Perfect for flights.',                 NOW() - INTERVAL '48 days'),
(11, 9,  5, 'Sound quality is exceptional. Comfortable even after 6 hours of use.',                 NOW() - INTERVAL '42 days'),
(3,  9,  4, 'Great headphones. ANC is top notch but design does not fold flat anymore.',             NOW() - INTERVAL '36 days'),
(2,  10, 5, 'These are my daily drivers. Transparency mode is like having no headphones in.',        NOW() - INTERVAL '45 days'),
(5,  10, 4, 'Great sound and ANC for the size. Battery case is convenient. A bit overpriced.',       NOW() - INTERVAL '38 days'),
(3,  15, 5, 'Super comfortable for daily wear. The Air unit makes a huge difference.',               NOW() - INTERVAL '55 days'),
(6,  15, 4, 'Stylish and comfortable. Runs slightly large so size down half a size.',                NOW() - INTERVAL '48 days'),
(13, 15, 5, 'Best running shoes I have owned. Very supportive and cushioned.',                       NOW() - INTERVAL '30 days'),
(9,  16, 4, 'Classic fit, great quality denim. Washes well and keeps its shape.',                   NOW() - INTERVAL '50 days'),
(14, 16, 5, 'Best jeans ever. Bought 3 pairs. The quality at this price is unbeatable.',            NOW() - INTERVAL '25 days'),
(2,  24, 5, 'Worth every cent. Makes baking so much easier. Built like a tank.',                    NOW() - INTERVAL '20 days'),
(8,  24, 5, 'Beautiful machine. Powerful motor handles even stiff bread dough with ease.',           NOW() - INTERVAL '15 days'),
(10, 24, 4, 'Great mixer but very heavy. Hard to move around the kitchen.',                         NOW() - INTERVAL '10 days'),
(12, 25, 5, 'Changed how I cook. Makes incredible soups and stews in a fraction of the time.',      NOW() - INTERVAL '35 days'),
(7,  25, 4, 'Very versatile. Takes time to learn all the settings but totally worth it.',            NOW() - INTERVAL '28 days'),
(6,  26, 5, 'Replaced my entire dumbbell rack. Space saving and incredibly well made.',              NOW() - INTERVAL '45 days'),
(14, 26, 4, 'Great product. Adjustment mechanism is smooth. A bit slow mid-workout.',               NOW() - INTERVAL '35 days'),
(4,  27, 5, 'Best yoga mat on the market. The alignment lines are incredibly helpful.',              NOW() - INTERVAL '40 days'),
(8,  27, 5, 'Non-slip surface is excellent even when sweaty. Worth the premium price.',              NOW() - INTERVAL '32 days'),
(3,  27, 4, 'Great quality mat. A bit heavy to carry to the studio.',                               NOW() - INTERVAL '25 days'),
(13, 29, 5, 'Every developer should read this. Changed the way I think about writing code.',         NOW() - INTERVAL '55 days'),
(15, 29, 5, 'Timeless classic. Examples are in Java which makes it even more relevant.',             NOW() - INTERVAL '45 days'),
(9,  29, 4, 'Great book but some examples feel dated. Still full of valuable insights.',             NOW() - INTERVAL '35 days'),
(11, 30, 5, 'Best Spring book out there. Covers everything you need for real applications.',         NOW() - INTERVAL '50 days'),
(15, 30, 4, 'Good coverage of Spring Boot. Would like more on microservices.',                      NOW() - INTERVAL '30 days'),
(5,  13, 5, 'M2 chip makes this feel more like a laptop than a tablet. Stage Manager is great.',    NOW() - INTERVAL '55 days'),
(11, 13, 4, 'Amazing display and performance. Very expensive with Apple Pencil and keyboard.',       NOW() - INTERVAL '45 days');

-- ============================================================
-- CARTS
-- ============================================================
INSERT INTO carts (user_id, created_at, updated_at) VALUES
(2,  NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'),
(3,  NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
(4,  NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
(5,  NOW() - INTERVAL '6 days', NOW() - INTERVAL '3 days'),
(6,  NOW() - INTERVAL '2 days', NOW()),
(7,  NOW() - INTERVAL '1 day',  NOW()),
(12, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
(13, NOW() - INTERVAL '2 days', NOW());

-- ============================================================
-- CART ITEMS
-- ============================================================
INSERT INTO cart_items (cart_id, product_id, variant_id, quantity) VALUES
(1, 3,  NULL, 1),   -- john: Google Pixel 8
(1, 28, NULL, 2),   -- john: Resistance Bands x2
(2, 14, NULL, 1),   -- jane: Samsung Tab S9
(2, 33, NULL, 1),   -- jane: Atomic Habits
(3, 7,  NULL, 1),   -- alice: Lenovo ThinkPad
(3, 23, NULL, 1),   -- alice: Nespresso
(4, 12, NULL, 1),   -- bob: JBL Charge
(4, 27, NULL, 1),   -- bob: Yoga Mat
(5, 4,  NULL, 1),   -- charlie: OnePlus 12
(6, 18, NULL, 1),   -- diana: Zara Dress
(6, 19, NULL, 2),   -- diana: H&M Blazer x2
(7, 5,  11,   1),   -- isabella: MacBook Pro (16GB/512GB variant)
(8, 31, NULL, 1),   -- jack: Designing Data-Intensive
(8, 32, NULL, 1);   -- jack: Midnight Library

-- ============================================================
-- VENDOR PAYOUTS (sample)
-- ============================================================
INSERT INTO vendor_payouts (vendor_id, order_id, amount, commission, net_amount, status, created_at) VALUES
(1, 1,  2249.98, 224.99, 2024.99, 'PAID',    NOW() - INTERVAL '60 days'),
(1, 3,  2149.98, 214.99, 1934.99, 'PAID',    NOW() - INTERVAL '55 days'),
(2, 2,   319.97,  32.00,  287.97, 'PAID',    NOW() - INTERVAL '58 days'),
(3, 7,   144.97,  14.49,  130.48, 'PAID',    NOW() - INTERVAL '35 days'),
(1, 4,  1099.99, 109.99,  990.00, 'PENDING', NOW() - INTERVAL '30 days'),
(1, 5,   509.98,  50.99,  458.99, 'PENDING', NOW() - INTERVAL '25 days');

-- ============================================================
-- SUMMARY
-- users:            18  (1 admin, 15 regular, 2 vendors)
-- user_addresses:    5
-- categories:       18  (5 root + 13 subcategories)
-- vendors:           3  (Tech Store, Fashion Hub, Book World)
-- vendor_apps:       3  (all approved)
-- products:         33  (with slugs, ratings, vendor assignments)
-- product_variants: 40  (iPhone, Samsung, MacBook, Nike, Levis, Adidas)
-- product_images:   33  (one per product)
-- orders:           15  (all statuses + full shipping)
-- order_items:      27
-- reviews:          37
-- carts:             8
-- cart_items:       14
-- vendor_payouts:    6
-- ============================================================