-- ============================================================
-- ECOMMERCE DATABASE SEED
-- Run AFTER schema.sql:
--   psql -U postgres -d ecommerce -f schema.sql
--   psql -U postgres -d ecommerce -f seed.sql
-- ============================================================

-- ============================================================
-- USERS
-- All passwords are BCrypt hash of: Password1!
-- ============================================================
INSERT INTO users (username, email, password, role, created_at) VALUES
('admin',    'admin@ecommerce.com',  '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_ADMIN', NOW() - INTERVAL '90 days'),
('john',     'john@gmail.com',       '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '80 days'),
('jane',     'jane@gmail.com',       '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '75 days'),
('alice',    'alice@yahoo.com',      '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '70 days'),
('bob',      'bob@yahoo.com',        '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '65 days'),
('charlie',  'charlie@hotmail.com',  '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '60 days'),
('diana',    'diana@hotmail.com',    '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '55 days'),
('eve',      'eve@gmail.com',        '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '50 days'),
('frank',    'frank@gmail.com',      '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '45 days'),
('grace',    'grace@outlook.com',    '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '40 days'),
('henry',    'henry@outlook.com',    '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '35 days'),
('isabella', 'isabella@gmail.com',   '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '30 days'),
('jack',     'jack@gmail.com',       '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '25 days'),
('karen',    'karen@yahoo.com',      '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '20 days'),
('liam',     'liam@yahoo.com',       '$2a$10$OlRFOaByOTspRfGMq85yBODZjQJLCqTM13EmVtU2waQlobc3GgO4m', 'ROLE_USER',  NOW() - INTERVAL '15 days');

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (id, name, description, parent_id) VALUES
(1,  'Electronics',       'Electronic devices and accessories',    NULL),
(2,  'Clothing',          'Fashion and apparel for all ages',       NULL),
(3,  'Home & Garden',     'Everything for your home and garden',    NULL),
(4,  'Sports',            'Sports equipment and activewear',        NULL),
(5,  'Books',             'Books across all genres',                NULL),
(6,  'Smartphones',       'Mobile phones and accessories',          1),
(7,  'Laptops',           'Laptops and notebooks',                  1),
(8,  'Audio',             'Headphones, speakers, and earbuds',      1),
(9,  'Tablets',           'Tablets and e-readers',                  1),
(10, 'Men''s Clothing',   'Clothing for men',                       2),
(11, 'Women''s Clothing', 'Clothing for women',                     2),
(12, 'Kids'' Clothing',   'Clothing for children',                  2),
(13, 'Furniture',         'Tables, chairs, sofas and more',         3),
(14, 'Kitchen',           'Kitchen appliances and utensils',        3),
(15, 'Fitness',           'Gym and fitness equipment',              4),
(16, 'Outdoor',           'Outdoor and camping gear',               4),
(17, 'Technology',        'Programming and tech books',             5),
(18, 'Fiction',           'Novels and fiction',                     5);

SELECT SETVAL('categories_id_seq', 18);

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO products (id, name, description, price, stock, slug, category_id, average_rating, review_count, created_at, updated_at) VALUES
(1,  'iPhone 15 Pro',           'Apple iPhone 15 Pro 256GB Space Black',                                          1299.99,  45, 'iphone-15-pro-1',            6,  4.7, 3, NOW() - INTERVAL '60 days', NOW()),
(2,  'Samsung Galaxy S24',      'Samsung Galaxy S24 256GB Phantom Black',                                          999.99,  60, 'samsung-galaxy-s24-2',       6,  4.0, 3, NOW() - INTERVAL '55 days', NOW()),
(3,  'Google Pixel 8',          'Google Pixel 8 128GB Obsidian',                                                   699.99,  35, 'google-pixel-8-3',           6,  0.0, 0, NOW() - INTERVAL '50 days', NOW()),
(4,  'OnePlus 12',              'OnePlus 12 256GB Silky Black',                                                    799.99,  25, 'oneplus-12-4',               6,  0.0, 0, NOW() - INTERVAL '45 days', NOW()),
(5,  'MacBook Pro 14"',         'Apple MacBook Pro 14" M3 Pro 512GB',                                            1999.99,  20, 'macbook-pro-14-5',           7,  4.7, 3, NOW() - INTERVAL '58 days', NOW()),
(6,  'Dell XPS 15',             'Dell XPS 15 Intel i9 32GB RAM 1TB SSD',                                         1799.99,  15, 'dell-xps-15-6',              7,  3.5, 2, NOW() - INTERVAL '52 days', NOW()),
(7,  'Lenovo ThinkPad X1',      'Lenovo ThinkPad X1 Carbon Gen 11',                                              1499.99,  18, 'lenovo-thinkpad-x1-7',       7,  0.0, 0, NOW() - INTERVAL '48 days', NOW()),
(8,  'ASUS ROG Zephyrus',       'ASUS ROG Zephyrus G14 Gaming Laptop',                                           1399.99,  12, 'asus-rog-zephyrus-8',        7,  0.0, 0, NOW() - INTERVAL '40 days', NOW()),
(9,  'Sony WH-1000XM5',         'Sony WH-1000XM5 Wireless Noise Cancelling',                                       349.99,  80, 'sony-wh-1000xm5-9',          8,  4.7, 3, NOW() - INTERVAL '55 days', NOW()),
(10, 'AirPods Pro 2',           'Apple AirPods Pro 2nd Generation',                                                249.99, 100, 'airpods-pro-2-10',           8,  4.5, 2, NOW() - INTERVAL '50 days', NOW()),
(11, 'Bose QuietComfort 45',    'Bose QuietComfort 45 Wireless Headphones',                                        329.99,  55, 'bose-quietcomfort-45-11',    8,  0.0, 0, NOW() - INTERVAL '45 days', NOW()),
(12, 'JBL Charge 5',            'JBL Charge 5 Portable Waterproof Speaker',                                        179.99,  70, 'jbl-charge-5-12',            8,  0.0, 0, NOW() - INTERVAL '42 days', NOW()),
(13, 'iPad Pro 12.9"',          'Apple iPad Pro 12.9" M2 256GB WiFi',                                            1099.99,  30, 'ipad-pro-12-9-13',           9,  4.5, 2, NOW() - INTERVAL '50 days', NOW()),
(14, 'Samsung Galaxy Tab S9',   'Samsung Galaxy Tab S9 Ultra 256GB',                                               999.99,  25, 'samsung-galaxy-tab-s9-14',   9,  0.0, 0, NOW() - INTERVAL '45 days', NOW()),
(15, 'Nike Air Max 270',        'Nike Air Max 270 Running Shoes Size 42',                                           149.99, 120, 'nike-air-max-270-15',        10, 4.7, 3, NOW() - INTERVAL '60 days', NOW()),
(16, 'Levis 501 Jeans',         'Levis 501 Original Fit Jeans Blue W32 L32',                                        89.99, 200, 'levis-501-jeans-16',         10, 4.5, 2, NOW() - INTERVAL '55 days', NOW()),
(17, 'Polo Ralph Lauren Shirt', 'Classic Fit Oxford Shirt Navy Blue',                                               79.99, 150, 'polo-ralph-lauren-shirt-17', 10, 0.0, 0, NOW() - INTERVAL '50 days', NOW()),
(18, 'Zara Floral Dress',       'Zara Floral Print Midi Dress Summer 2024',                                         59.99, 180, 'zara-floral-dress-18',       11, 0.0, 0, NOW() - INTERVAL '45 days', NOW()),
(19, 'H&M Blazer',              'H&M Fitted Single-Breasted Blazer Black',                                          69.99, 130, 'hm-blazer-19',               11, 0.0, 0, NOW() - INTERVAL '40 days', NOW()),
(20, 'Adidas Ultraboost 22',    'Adidas Ultraboost 22 Womens Running Shoes',                                       179.99,  90, 'adidas-ultraboost-22-20',    11, 0.0, 0, NOW() - INTERVAL '35 days', NOW()),
(21, 'IKEA KALLAX Shelf',       'IKEA KALLAX 4x4 Shelf Unit White',                                                249.99,  40, 'ikea-kallax-shelf-21',       13, 0.0, 0, NOW() - INTERVAL '55 days', NOW()),
(22, 'Herman Miller Aeron',     'Herman Miller Aeron Ergonomic Office Chair',                                      1499.99,   8, 'herman-miller-aeron-22',     13, 0.0, 0, NOW() - INTERVAL '50 days', NOW()),
(23, 'Nespresso Vertuo',        'Nespresso Vertuo Next Coffee Machine Black',                                        149.99,  60, 'nespresso-vertuo-23',        14, 0.0, 0, NOW() - INTERVAL '48 days', NOW()),
(24, 'KitchenAid Mixer',        'KitchenAid Artisan Stand Mixer 4.8L Empire Red',                                   499.99,  25, 'kitchenaid-mixer-24',        14, 4.7, 3, NOW() - INTERVAL '45 days', NOW()),
(25, 'Instant Pot Duo 7',       'Instant Pot Duo 7-in-1 Electric Pressure Cooker',                                   99.99,  85, 'instant-pot-duo-7-25',       14, 4.5, 2, NOW() - INTERVAL '40 days', NOW()),
(26, 'Bowflex Dumbbells',       'Bowflex SelectTech 552 Adjustable Dumbbells',                                       399.99,  20, 'bowflex-dumbbells-26',       15, 4.5, 2, NOW() - INTERVAL '50 days', NOW()),
(27, 'Yoga Mat Premium',        'Liforme Original Yoga Mat 4.2mm Non-Slip',                                           99.99,  75, 'yoga-mat-premium-27',        15, 4.7, 3, NOW() - INTERVAL '45 days', NOW()),
(28, 'Resistance Bands Set',    'INTEY Resistance Bands Set 5 Levels',                                                29.99, 200, 'resistance-bands-set-28',    15, 0.0, 0, NOW() - INTERVAL '40 days', NOW()),
(29, 'Clean Code',              'Clean Code: A Handbook of Agile Software Craftsmanship by Robert C. Martin',         39.99, 120, 'clean-code-29',              17, 4.7, 3, NOW() - INTERVAL '60 days', NOW()),
(30, 'Spring in Action',        'Spring in Action 6th Edition by Craig Walls',                                        49.99,  80, 'spring-in-action-30',        17, 4.5, 2, NOW() - INTERVAL '55 days', NOW()),
(31, 'Designing Data-Intensive','Designing Data-Intensive Applications by Martin Kleppmann',                          54.99,  65, 'designing-data-intensive-31', 17, 0.0, 0, NOW() - INTERVAL '50 days', NOW()),
(32, 'The Midnight Library',    'The Midnight Library by Matt Haig',                                                  16.99, 150, 'the-midnight-library-32',    18, 0.0, 0, NOW() - INTERVAL '45 days', NOW()),
(33, 'Atomic Habits',           'Atomic Habits by James Clear',                                                       18.99, 200, 'atomic-habits-33',           18, 0.0, 0, NOW() - INTERVAL '40 days', NOW());

SELECT SETVAL('products_id_seq', 33);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
INSERT INTO product_images (product_id, image_url, is_primary, sort_order, created_at) VALUES
(1,  '/api/images/products/product_1_iphone_15_pro.jpg',            TRUE, 0, NOW()),
(2,  '/api/images/products/product_2_samsung_galaxy_s24.jpg',       TRUE, 0, NOW()),
(3,  '/api/images/products/product_3_google_pixel_8.jpg',           TRUE, 0, NOW()),
(4,  '/api/images/products/product_4_oneplus_12.jpg',               TRUE, 0, NOW()),
(5,  '/api/images/products/product_5_macbook_pro_14.jpg',           TRUE, 0, NOW()),
(6,  '/api/images/products/product_6_dell_xps_15.jpg',              TRUE, 0, NOW()),
(7,  '/api/images/products/product_7_lenovo_thinkpad_x1.jpg',       TRUE, 0, NOW()),
(8,  '/api/images/products/product_8_asus_rog_zephyrus.jpg',        TRUE, 0, NOW()),
(9,  '/api/images/products/product_9_sony_wh-1000xm5.jpg',          TRUE, 0, NOW()),
(10, '/api/images/products/product_10_airpods_pro_2.jpg',           TRUE, 0, NOW()),
(11, '/api/images/products/product_11_bose_qc45.jpg',               TRUE, 0, NOW()),
(12, '/api/images/products/product_12_jbl_charge_5.jpg',            TRUE, 0, NOW()),
(13, '/api/images/products/product_13_ipad_pro_12.9.jpg',           TRUE, 0, NOW()),
(14, '/api/images/products/product_14_samsung_galaxy_tab_s9.jpg',   TRUE, 0, NOW()),
(15, '/api/images/products/product_15_nike_air_max_270.jpg',        TRUE, 0, NOW()),
(16, '/api/images/products/product_16_levis_501_jeans.jpg',         TRUE, 0, NOW()),
(17, '/api/images/products/product_17_polo_ralph_lauren.jpg',       TRUE, 0, NOW()),
(18, '/api/images/products/product_18_zara_floral_dress.jpg',       TRUE, 0, NOW()),
(19, '/api/images/products/product_19_handm_blazer.jpg',            TRUE, 0, NOW()),
(20, '/api/images/products/product_20_adidas_ultraboost_22.jpg',    TRUE, 0, NOW()),
(21, '/api/images/products/product_21_ikea_kallax_shelf.jpg',       TRUE, 0, NOW()),
(22, '/api/images/products/product_22_herman_miller_aeron.jpg',     TRUE, 0, NOW()),
(23, '/api/images/products/product_23_nespresso_vertuo.jpg',        TRUE, 0, NOW()),
(24, '/api/images/products/product_24_kitchenaid_mixer.jpg',        TRUE, 0, NOW()),
(25, '/api/images/products/product_25_instant_pot_duo_7.jpg',       TRUE, 0, NOW()),
(26, '/api/images/products/product_26_bowflex_dumbbells.jpg',       TRUE, 0, NOW()),
(27, '/api/images/products/product_27_yoga_mat_premium.jpg',        TRUE, 0, NOW()),
(28, '/api/images/products/product_28_resistance_bands_set.jpg',    TRUE, 0, NOW()),
(29, '/api/images/products/product_29_clean_code.jpg',              TRUE, 0, NOW()),
(30, '/api/images/products/product_30_spring_in_action.jpg',        TRUE, 0, NOW()),
(31, '/api/images/products/product_31_designing_data-intensive.jpg',TRUE, 0, NOW()),
(32, '/api/images/products/product_32_the_midnight_library.jpg',    TRUE, 0, NOW()),
(33, '/api/images/products/product_33_atomic_habits.jpg',           TRUE, 0, NOW());

-- ============================================================
-- ORDERS
-- ============================================================
INSERT INTO orders (id, user_id, status, payment_method, total_amount, full_name, phone, address_line, city, country, notes, created_at) VALUES
(1,  2,  'DELIVERED', 'CREDIT_CARD',      2249.98, 'John Smith',      '+1 555 001 0001', '123 Main St Apt 4B',    'New York',     'USA',    NULL,                       NOW() - INTERVAL '70 days'),
(2,  3,  'DELIVERED', 'CASH_ON_DELIVERY',  319.97, 'Jane Doe',        '+1 555 002 0002', '456 Oak Avenue',        'Los Angeles',  'USA',    NULL,                       NOW() - INTERVAL '68 days'),
(3,  4,  'DELIVERED', 'CREDIT_CARD',      2149.98, 'Alice Johnson',   '+1 555 003 0003', '789 Pine Road Suite 2', 'Chicago',      'USA',    'Leave at the door',        NOW() - INTERVAL '65 days'),
(4,  5,  'SHIPPED',   'CREDIT_CARD',      1099.99, 'Bob Williams',    '+1 555 004 0004', '321 Elm Street',        'Houston',      'USA',    NULL,                       NOW() - INTERVAL '60 days'),
(5,  6,  'SHIPPED',   'CASH_ON_DELIVERY',  509.98, 'Charlie Brown',   '+1 555 005 0005', '654 Maple Drive',       'Phoenix',      'USA',    NULL,                       NOW() - INTERVAL '55 days'),
(6,  7,  'CONFIRMED', 'CREDIT_CARD',       349.99, 'Diana Prince',    '+1 555 006 0006', '987 Cedar Lane',        'Philadelphia', 'USA',    NULL,                       NOW() - INTERVAL '50 days'),
(7,  8,  'CONFIRMED', 'CASH_ON_DELIVERY',  144.97, 'Eve Wilson',      '+1 555 007 0007', '147 Birch Boulevard',   'San Antonio',  'USA',    'Ring doorbell twice',      NOW() - INTERVAL '45 days'),
(8,  9,  'PENDING',   'CREDIT_CARD',      1799.99, 'Frank Miller',    '+1 555 008 0008', '258 Walnut Court',      'San Diego',    'USA',    NULL,                       NOW() - INTERVAL '40 days'),
(9,  10, 'PENDING',   'CASH_ON_DELIVERY',  159.97, 'Grace Lee',       '+1 555 009 0009', '369 Spruce Way',        'Dallas',       'USA',    NULL,                       NOW() - INTERVAL '35 days'),
(10, 11, 'CANCELLED', 'CREDIT_CARD',       999.99, 'Henry Davis',     '+1 555 010 0010', '741 Aspen Circle',      'San Jose',     'USA',    NULL,                       NOW() - INTERVAL '30 days'),
(11, 2,  'DELIVERED', 'CREDIT_CARD',       499.99, 'John Smith',      '+1 555 001 0001', '123 Main St Apt 4B',    'New York',     'USA',    NULL,                       NOW() - INTERVAL '25 days'),
(12, 3,  'SHIPPED',   'CASH_ON_DELIVERY',  309.97, 'Jane Doe',        '+1 555 002 0002', '456 Oak Avenue',        'Los Angeles',  'USA',    NULL,                       NOW() - INTERVAL '20 days'),
(13, 4,  'CONFIRMED', 'CREDIT_CARD',       149.99, 'Alice Johnson',   '+1 555 003 0003', '789 Pine Road Suite 2', 'Chicago',      'USA',    NULL,                       NOW() - INTERVAL '15 days'),
(14, 12, 'PENDING',   'CASH_ON_DELIVERY', 1299.99, 'Isabella Garcia', '+1 555 012 0012', '852 Cypress Street',    'Austin',       'USA',    NULL,                       NOW() - INTERVAL '10 days'),
(15, 13, 'PENDING',   'CREDIT_CARD',       127.96, 'Jack Martinez',   '+1 555 013 0013', '963 Magnolia Road',     'Jacksonville', 'USA',    'Fragile items',            NOW() - INTERVAL '5 days');

SELECT SETVAL('orders_id_seq', 15);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
(1,  5,  'MacBook Pro 14"',          1, 1999.99),
(1,  10, 'AirPods Pro 2',            1,  249.99),
(2,  15, 'Nike Air Max 270',         1,  149.99),
(2,  16, 'Levis 501 Jeans',          1,   89.99),
(2,  17, 'Polo Ralph Lauren Shirt',  1,   79.99),
(3,  6,  'Dell XPS 15',              1, 1799.99),
(3,  9,  'Sony WH-1000XM5',          1,  349.99),
(4,  13, 'iPad Pro 12.9"',           1, 1099.99),
(5,  11, 'Bose QuietComfort 45',     1,  329.99),
(5,  12, 'JBL Charge 5',             1,  179.99),
(6,  9,  'Sony WH-1000XM5',          1,  349.99),
(7,  29, 'Clean Code',               1,   39.99),
(7,  30, 'Spring in Action',         1,   49.99),
(7,  31, 'Designing Data-Intensive', 1,   54.99),
(8,  6,  'Dell XPS 15',              1, 1799.99),
(9,  27, 'Yoga Mat Premium',         1,   99.99),
(9,  28, 'Resistance Bands Set',     2,   29.99),
(10, 2,  'Samsung Galaxy S24',       1,  999.99),
(11, 24, 'KitchenAid Mixer',         1,  499.99),
(12, 18, 'Zara Floral Dress',        1,   59.99),
(12, 19, 'H&M Blazer',               1,   69.99),
(12, 20, 'Adidas Ultraboost 22',     1,  179.99),
(13, 15, 'Nike Air Max 270',         1,  149.99),
(14, 1,  'iPhone 15 Pro',            1, 1299.99),
(15, 29, 'Clean Code',               1,   39.99),
(15, 30, 'Spring in Action',         1,   49.99),
(15, 33, 'Atomic Habits',            2,   18.99);

-- ============================================================
-- REVIEWS
-- ============================================================
INSERT INTO reviews (user_id, product_id, rating, comment, created_at) VALUES
(2,  1,  5, 'Absolutely love this phone! Camera is incredible, battery lasts all day.',                    NOW() - INTERVAL '55 days'),
(3,  1,  4, 'Great phone overall. A bit pricey but the build quality is outstanding.',                     NOW() - INTERVAL '50 days'),
(4,  1,  5, 'Best iPhone yet. The titanium design feels premium and performance is blazing fast.',          NOW() - INTERVAL '45 days'),
(5,  2,  4, 'Excellent Android phone. Display is gorgeous and the AI features are genuinely useful.',      NOW() - INTERVAL '50 days'),
(6,  2,  5, 'Switched from iPhone and could not be happier. Camera system is phenomenal.',                 NOW() - INTERVAL '45 days'),
(7,  2,  3, 'Good phone but gets warm under heavy load. Battery could be better.',                         NOW() - INTERVAL '40 days'),
(2,  5,  5, 'M3 Pro chip is a beast. Handles everything I throw at it effortlessly.',                      NOW() - INTERVAL '60 days'),
(8,  5,  5, 'Battery life is insane, easily 12 hours of real work. The display is stunning.',              NOW() - INTERVAL '55 days'),
(9,  5,  4, 'Incredible performance but very expensive. The notch is still annoying in 2024.',             NOW() - INTERVAL '48 days'),
(4,  6,  4, 'Great Windows laptop. Display is 4K OLED and absolutely beautiful. Runs hot though.',         NOW() - INTERVAL '45 days'),
(10, 6,  3, 'Good specs but the fan noise under load is distracting.',                                     NOW() - INTERVAL '40 days'),
(7,  9,  5, 'Best noise cancellation I have ever experienced. Perfect for flights and open offices.',      NOW() - INTERVAL '48 days'),
(11, 9,  5, 'Sound quality is exceptional. Comfortable even after 6 hours of use.',                       NOW() - INTERVAL '42 days'),
(3,  9,  4, 'Great headphones. ANC is top notch but the new design does not fold flat anymore.',           NOW() - INTERVAL '36 days'),
(2,  10, 5, 'These are my daily drivers. Transparency mode is like having no headphones in.',              NOW() - INTERVAL '45 days'),
(5,  10, 4, 'Great sound and ANC for the size. Battery case is convenient. A bit overpriced.',             NOW() - INTERVAL '38 days'),
(3,  15, 5, 'Super comfortable for daily wear. The Air unit makes a huge difference.',                     NOW() - INTERVAL '55 days'),
(6,  15, 4, 'Stylish and comfortable. Runs slightly large so size down half a size.',                      NOW() - INTERVAL '48 days'),
(13, 15, 5, 'Best running shoes I have owned. Very supportive and cushioned.',                             NOW() - INTERVAL '30 days'),
(9,  16, 4, 'Classic fit, great quality denim. Washes well and keeps its shape.',                          NOW() - INTERVAL '50 days'),
(14, 16, 5, 'Best jeans ever. Bought 3 pairs. The quality at this price is unbeatable.',                  NOW() - INTERVAL '25 days'),
(2,  24, 5, 'Worth every cent. Makes baking so much easier. Built like a tank.',                           NOW() - INTERVAL '20 days'),
(8,  24, 5, 'Beautiful machine. Powerful motor handles even stiff bread dough with ease.',                 NOW() - INTERVAL '15 days'),
(10, 24, 4, 'Great mixer but very heavy. Hard to move around the kitchen.',                                NOW() - INTERVAL '10 days'),
(12, 25, 5, 'Changed how I cook. Makes incredible soups and stews in a fraction of the time.',            NOW() - INTERVAL '35 days'),
(7,  25, 4, 'Very versatile. Takes time to learn all the settings but totally worth it.',                  NOW() - INTERVAL '28 days'),
(6,  26, 5, 'Replaced my entire dumbbell rack. Space saving and incredibly well made.',                    NOW() - INTERVAL '45 days'),
(14, 26, 4, 'Great product. Adjustment mechanism is smooth. A bit slow to change weights mid-workout.',    NOW() - INTERVAL '35 days'),
(4,  27, 5, 'Best yoga mat on the market. The alignment lines are incredibly helpful.',                    NOW() - INTERVAL '40 days'),
(8,  27, 5, 'Non-slip surface is excellent even when sweaty. Worth the premium price.',                    NOW() - INTERVAL '32 days'),
(3,  27, 4, 'Great quality mat. A bit heavy to carry to the studio but perfect for home use.',             NOW() - INTERVAL '25 days'),
(13, 29, 5, 'Every developer should read this. Changed the way I think about writing code.',               NOW() - INTERVAL '55 days'),
(15, 29, 5, 'Timeless classic. The examples are in Java which makes it even more relevant.',               NOW() - INTERVAL '45 days'),
(9,  29, 4, 'Great book but some examples feel dated. Still full of valuable insights.',                   NOW() - INTERVAL '35 days'),
(11, 30, 5, 'Best Spring book out there. Covers everything you need to build real applications.',          NOW() - INTERVAL '50 days'),
(15, 30, 4, 'Good coverage of Spring Boot. Would like more on microservices.',                             NOW() - INTERVAL '30 days'),
(5,  13, 5, 'M2 chip makes this feel more like a laptop than a tablet. Stage Manager is brilliant.',      NOW() - INTERVAL '55 days'),
(11, 13, 4, 'Amazing display and performance. Very expensive especially with Apple Pencil and keyboard.',  NOW() - INTERVAL '45 days');

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
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
(1, 3,  1),
(1, 28, 2),
(2, 14, 1),
(2, 33, 1),
(3, 7,  1),
(3, 23, 1),
(4, 12, 1),
(4, 27, 1),
(5, 4,  1),
(6, 18, 1),
(6, 19, 2),
(7, 5,  1),
(8, 31, 1),
(8, 32, 1);

-- ============================================================
-- SUMMARY
-- users:       15  (1 admin + 14 regular | password: Password1!)
-- categories:  18  (5 root + 13 subcategories)
-- products:    33  (with slugs + ratings)
-- images:      33  (one primary per product)
-- orders:      15  (all statuses + full shipping info)
-- order_items: 27
-- reviews:     37
-- carts:        8
-- cart_items:  14
-- ============================================================