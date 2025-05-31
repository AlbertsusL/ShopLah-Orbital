CREATE DATABASE ShopLahDB;

CREATE TABLE products(
    productId SERIAL PRIMARY KEY, 
    productCategory VARCHAR(255) REQUIRED,
    productName VARCHAR(255) REQUIRED,
    productDescription VARCHAR(255) REQUIRED, 
    price FLOAT(2) FLOAT check(price > 0) REQUIRED,
    quantity INT REQUIRED,
    review FLOAT(1) DEFAULT 0.0
);