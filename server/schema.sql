-- ========================================================
-- QuickBasket Database Schema (MySQL 8.0+)
-- Blinkit & BigBasket E-Commerce Clone Architecture
-- ========================================================

CREATE DATABASE IF NOT EXISTS `quickbasket_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `quickbasket_db`;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(64) DEFAULT '🛒',
  `image` TEXT,
  `item_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(128) DEFAULT 'Farm Fresh',
  `category` VARCHAR(64) NOT NULL,
  `unit` VARCHAR(64) DEFAULT '1 unit',
  `price` DECIMAL(10,2) NOT NULL,
  `mrp` DECIMAL(10,2) NOT NULL,
  `rating` DECIMAL(3,2) DEFAULT 4.50,
  `reviews_count` INT DEFAULT 1,
  `delivery_time` VARCHAR(64) DEFAULT '10 mins',
  `image` TEXT,
  `in_stock` BOOLEAN DEFAULT TRUE,
  `stock` INT DEFAULT 50,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_price` (`price`),
  INDEX `idx_instock` (`in_stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Saved Addresses Table
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` VARCHAR(64) PRIMARY KEY,
  `tag` VARCHAR(64) DEFAULT 'Home',
  `recipient` VARCHAR(128) DEFAULT 'Customer',
  `phone` VARCHAR(32) DEFAULT '+91 99999 99999',
  `flat` TEXT NOT NULL,
  `area` TEXT NOT NULL,
  `city` VARCHAR(128) DEFAULT 'Bengaluru',
  `pincode` VARCHAR(16) NOT NULL,
  `eta` VARCHAR(64) DEFAULT '8-10 MINS',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Promotional Coupons Table
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` VARCHAR(64) PRIMARY KEY,
  `code` VARCHAR(64) NOT NULL UNIQUE,
  `description` TEXT,
  `discount_percent` INT DEFAULT 0,
  `max_discount` DECIMAL(10,2) DEFAULT 0,
  `min_order` DECIMAL(10,2) DEFAULT 0,
  `free_delivery` BOOLEAN DEFAULT FALSE,
  `discount_amount` DECIMAL(10,2) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) PRIMARY KEY,
  `created_at` VARCHAR(64) NOT NULL,
  `status` VARCHAR(64) DEFAULT 'received',
  `delivery_time_est` VARCHAR(64) DEFAULT '10 mins',
  `subtotal` DECIMAL(10,2) NOT NULL,
  `delivery_fee` DECIMAL(10,2) DEFAULT 0,
  `handling_fee` DECIMAL(10,2) DEFAULT 4.00,
  `tip` DECIMAL(10,2) DEFAULT 0,
  `discount` DECIMAL(10,2) DEFAULT 0,
  `coupon_code` VARCHAR(64) DEFAULT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `address_json` JSON,
  `payment_method` VARCHAR(128) NOT NULL,
  `payment_status` VARCHAR(64) DEFAULT 'PAID',
  `payment_details_json` JSON,
  `rider_json` JSON,
  `items_json` JSON,
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Payment Settings Table (UPI, Razorpay, COD configuration)
CREATE TABLE IF NOT EXISTS `payment_settings` (
  `id` VARCHAR(64) PRIMARY KEY DEFAULT 'default',
  `data_json` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

