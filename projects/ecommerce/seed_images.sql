-- ============================================================
-- PRODUCT IMAGES SEED
-- 
-- STEP 1: Copy all images from product_images/ folder to:
--         <your-project>/uploads/products/
--
-- STEP 2: Run this SQL against your ecommerce database:
--         psql -U postgres -d ecommerce -f seed_images.sql
-- ============================================================

-- Clear existing product images
TRUNCATE TABLE product_images RESTART IDENTITY CASCADE;

-- Insert one primary image per product
INSERT INTO product_images (product_id, image_url, is_primary, sort_order, created_at) VALUES
(1, '/api/images/products/product_1_iphone_15_pro.jpg', TRUE, 0, NOW()),
(2, '/api/images/products/product_2_samsung_galaxy_s24.jpg', TRUE, 0, NOW()),
(3, '/api/images/products/product_3_google_pixel_8.jpg', TRUE, 0, NOW()),
(4, '/api/images/products/product_4_oneplus_12.jpg', TRUE, 0, NOW()),
(5, '/api/images/products/product_5_macbook_pro_14.jpg', TRUE, 0, NOW()),
(6, '/api/images/products/product_6_dell_xps_15.jpg', TRUE, 0, NOW()),
(7, '/api/images/products/product_7_lenovo_thinkpad_x1.jpg', TRUE, 0, NOW()),
(8, '/api/images/products/product_8_asus_rog_zephyrus.jpg', TRUE, 0, NOW()),
(9, '/api/images/products/product_9_sony_wh-1000xm5.jpg', TRUE, 0, NOW()),
(10, '/api/images/products/product_10_airpods_pro_2.jpg', TRUE, 0, NOW()),
(11, '/api/images/products/product_11_bose_qc45.jpg', TRUE, 0, NOW()),
(12, '/api/images/products/product_12_jbl_charge_5.jpg', TRUE, 0, NOW()),
(13, '/api/images/products/product_13_ipad_pro_12.9.jpg', TRUE, 0, NOW()),
(14, '/api/images/products/product_14_samsung_galaxy_tab_s9.jpg', TRUE, 0, NOW()),
(15, '/api/images/products/product_15_nike_air_max_270.jpg', TRUE, 0, NOW()),
(16, '/api/images/products/product_16_levis_501_jeans.jpg', TRUE, 0, NOW()),
(17, '/api/images/products/product_17_polo_ralph_lauren.jpg', TRUE, 0, NOW()),
(18, '/api/images/products/product_18_zara_floral_dress.jpg', TRUE, 0, NOW()),
(19, '/api/images/products/product_19_handm_blazer.jpg', TRUE, 0, NOW()),
(20, '/api/images/products/product_20_adidas_ultraboost_22.jpg', TRUE, 0, NOW()),
(21, '/api/images/products/product_21_ikea_kallax_shelf.jpg', TRUE, 0, NOW()),
(22, '/api/images/products/product_22_herman_miller_aeron.jpg', TRUE, 0, NOW()),
(23, '/api/images/products/product_23_nespresso_vertuo.jpg', TRUE, 0, NOW()),
(24, '/api/images/products/product_24_kitchenaid_mixer.jpg', TRUE, 0, NOW()),
(25, '/api/images/products/product_25_instant_pot_duo_7.jpg', TRUE, 0, NOW()),
(26, '/api/images/products/product_26_bowflex_dumbbells.jpg', TRUE, 0, NOW()),
(27, '/api/images/products/product_27_yoga_mat_premium.jpg', TRUE, 0, NOW()),
(28, '/api/images/products/product_28_resistance_bands_set.jpg', TRUE, 0, NOW()),
(29, '/api/images/products/product_29_clean_code.jpg', TRUE, 0, NOW()),
(30, '/api/images/products/product_30_spring_in_action.jpg', TRUE, 0, NOW()),
(31, '/api/images/products/product_31_designing_data-intensive.jpg', TRUE, 0, NOW()),
(32, '/api/images/products/product_32_the_midnight_library.jpg', TRUE, 0, NOW()),
(33, '/api/images/products/product_33_atomic_habits.jpg', TRUE, 0, NOW());

-- Verify
SELECT p.name, pi.image_url FROM products p JOIN product_images pi ON p.id = pi.product_id ORDER BY p.id;