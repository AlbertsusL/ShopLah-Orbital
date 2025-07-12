{/*
CREATE DATABASE ShopLah;

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  stock INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);*

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    seller_id VARCHAR(255),
    buyer_name VARCHAR(255),
    buyer_email VARCHAR(255),
    buyer_address TEXT,
    buyer_phone VARCHAR(50),
    quantity INTEGER,
    total DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER,
    buyer_name VARCHAR(255),
    buyer_email VARCHAR(255),
    rating INTEGER,
    comment TEXT,
    product_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
/}
