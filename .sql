-- 1. GENDERS
CREATE TABLE Genders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. ROLE
CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 3. USER
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    phone VARCHAR(15),
    address TEXT,
    birthday DATE,
    gender_id INT,
    role_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gender_id) REFERENCES Genders(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE RESTRICT,
    INDEX (email)
);

-- 4. CART
CREATE TABLE Cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX (user_id)
);

-- 5. CART ITEM
CREATE TABLE CartItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  color_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  FOREIGN KEY (cart_id) REFERENCES Cart(id) ON DELETE CASCADE,
  FOREIGN KEY (color_id) REFERENCES ProductColors(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
  INDEX idx_cart_id (cart_id),
  INDEX idx_product_id (product_id),
  INDEX idx_cart_product (cart_id, product_id)
);

-- 	6. CAROUCEL IMAGE
CREATE TABLE CarouselImages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    image_url VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. CATEGORIES
CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. BRANDS
CREATE TABLE Brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 9. COUPONS
CREATE TABLE Coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    discount INT NOT NULL CHECK (discount BETWEEN 1 AND 100),
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (valid_to > valid_from)
);

-- 10. PRODUCTS
CREATE TABLE Products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    category_id INT,
    brand_id INT,
    coupon_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES Brands(id) ON DELETE SET NULL,
    FOREIGN KEY (coupon_id) REFERENCES Coupons(id) ON DELETE SET NULL,
    INDEX (category_id),
    INDEX (brand_id)
);

-- 11. PRODUCT COLOR
CREATE TABLE ProductColors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    color VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 0 CHECK (quantity >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
    INDEX (product_id) 
);

-- 12. PRODUCT IMAGES
CREATE TABLE ProductImages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

-- 13. ORDER STATUS
CREATE TABLE OrderStatus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 14. ORDER
CREATE TABLE Orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status_id INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (status_id) REFERENCES OrderStatus(id) ON DELETE RESTRICT,
  INDEX (user_id),
  INDEX (status_id)
);

-- 15. ORDER ITEM
CREATE TABLE OrderItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  color_id INT NOT NULL,
  quantity INT DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
  FOREIGN KEY (color_id) REFERENCES ProductColors(id),
  FOREIGN KEY (product_id) REFERENCES Products(id),
  INDEX (product_id)
);

-- 16. PREVIEW
CREATE TABLE Reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX (product_id),
  INDEX (user_id)
);

-- 17. BLOG
CREATE TABLE Blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 18. RESET PASSWORD CODE
CREATE TABLE PasswordResetCodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    expiration DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX (code)
);

-- Data
INSERT INTO Genders (name) VALUES 
('Male'),
('Female'),
('Other');

INSERT INTO Roles (name) VALUES 
('Admin'),
('User');

INSERT INTO Users (name, 
    email, 
    password, 
    avatar, 
    phone, 
    address, 
    birthday, 
    gender_id, 
    role_id, 
    is_deleted, 
    created_at, 
    updated_at)
VALUES (
    'Admin', 
    'quocvan289@gmail.com', 
    '$2b$10$c.sIN0we89Ar1R2OfEVsHODUXBQfsDxR2tO7fZdewU.XlGAup97aO',
    NULL, 
    NULL, 
    NULL, 
    NULL, 
    (SELECT id FROM Genders WHERE name = 'Male'), -- Thay đổi nếu cần
    (SELECT id FROM Roles WHERE name = 'Admin'), 
    FALSE, 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP 
);














