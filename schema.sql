-- =============================================
-- Pathan Ice-cream Parlor - MySQL Database Schema
-- Run: mysql -u root -p < schema.sql
-- =============================================

CREATE DATABASE IF NOT EXISTS icecream_parlor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE icecream_parlor_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(255),
  category VARCHAR(50),
  available BOOLEAN DEFAULT TRUE
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(50) DEFAULT 'Home',
  address_line TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  address_id INT,
  delivery_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cod','upi','card') NOT NULL,
  payment_status ENUM('pending','paid') DEFAULT 'pending',
  order_status ENUM('placed','confirmed','out_for_delivery','delivered','cancelled') DEFAULT 'placed',
  estimated_delivery VARCHAR(50) DEFAULT '10 minutes',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =============================================
-- Seed: Ice Cream Products
-- =============================================
INSERT INTO products (name, description, price, image, category) VALUES
('Vanilla', 'Classic and creamy vanilla flavour, made with pure Madagascar vanilla beans.', 80.00, 'images/vanilla.jpg', 'Classic'),
('Chocolate', 'Rich and indulgent chocolate ice cream, crafted with premium cocoa.', 90.00, 'images/chocolate.jpg', 'Classic'),
('Strawberry', 'Fresh and fruity strawberry ice cream, bursting with real fruit chunks.', 85.00, 'images/strawberry.jpg', 'Fruit'),
('Mango', 'Sweet and refreshing Alphonso mango flavour — a summer favourite!', 85.00, 'images/mango.jpg', 'Fruit'),
('Butterscotch', 'Creamy butterscotch ice cream with crispy caramel bites.', 95.00, 'images/butterscotch.jpg', 'Premium'),
('Black Currant', 'Sweet and tangy black currant swirls in every scoop.', 95.00, 'images/blackcurrant.jpg', 'Premium');

SELECT 'Database setup complete! 6 products seeded.' AS message;
