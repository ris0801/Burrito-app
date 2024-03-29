# Burrito-app

# Burrito Shop Project

## Description

This project is a Burrito Shop application with frontend, backend, and a MySQL database. It allows users to view a menu of burritos, create orders, and view order details.
Functionalities that have implemented till now
1. Landing page would give options of all the Burritos available
2. It would also have options for Employee Login and Place order
3. Placing order takes to another page, where the customer can order burritos, with added options like (olives, rice, etc.)
4. Emlpoyee login takes to the page where the employee can take a look at all pending orders sequentially
5. It also gives the employee an option to mark the order as prepared

## Table of Contents

- [Setting up to run project through Docker](#Setup)
- [Backend](#backend)
- [Frontend](#frontend)
- [Database](#database)
- [Running the Project](#running-the-project)


## Setting up to run project through Docker (Follow exact steps and it should work!)
Setting up SQL: 
```
docker pull mysql
docker network create burrito-network
docker run --name my-mysql-network -e MYSQL_ROOT_PASSWORD=mypassword --network=burrito-network -d -p 3308:3306 mysql
```

```
   CREATE DATABASE burrito_shop;

   CREATE TABLE burritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    price DECIMAL(10, 2)
    );
   
    CREATE TABLE orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      total_cost DECIMAL(10, 2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE orders ADD COLUMN preparation_status BOOLEAN DEFAULT 0;
       
    CREATE TABLE order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      burrito_id INT,
      quantity INT,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (burrito_id) REFERENCES burritos(id)
    );
    
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('employee', 'customer') NOT NULL
    );
    
    CREATE TABLE burrito_options (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      additional_cost DECIMAL(10, 2) DEFAULT 0.00
    );

     CREATE TABLE burrito_burrito_options (
    burrito_id INT,
    option_id INT,
    FOREIGN KEY (burrito_id) REFERENCES burritos(id),
    FOREIGN KEY (option_id) REFERENCES burrito_options(id),
    PRIMARY KEY (burrito_id, option_id)
    );

   INSERT INTO burrito_options (name, additional_cost) VALUES 
    ('Black Olives', 0.50),
    ('Rice', 0.30),
    ('Sour Cream', 0.40),
    ('Cheese', 0.50),
    ('Guacamole', 1.00);

   INSERT INTO users (username, password, role) VALUES ('testuser', 'plaintextpassword', 'employee');

   INSERT INTO burritos (name, size, price) VALUES ('Chicken Burrito', 'Regular', 3.00);

    INSERT INTO burritos (name, size, price) VALUES 
    ('Beef Burrito', 'Regular', 4.00),
    ('Veggie Burrito', 'Regular', 3.50),
    ('Pork Burrito', 'Regular', 4.50),
    ('Chicken Burrito', 'XL', 5.00),
    ('Beef Burrito', 'XL', 6.00),
    ('Veggie Burrito', 'XL', 5.50),
    ('Pork Burrito', 'XL', 6.50);

   INSERT INTO burrito_burrito_options (burrito_id, option_id) VALUES
   (1, 1),  
   (1, 2),  
   (2, 1),  
   (2, 3),  
   (3, 2),  
   (3, 3);  
  
   ```


Go to backend directory: 
```
docker build -t my-burrito-backend-dev .
docker run -d --name my-burrito-backend-dev-container --network=burrito-network -p 3001:3001 my-burrito-backend-dev
```

Go to frontend directory: 
```
docker build -t my-burrito-frontend-dev .
docker run -d --name my-burrito-frontend-dev-container --network=burrito-network -p 3000:3000 my-burrito-frontend-dev
```

## Backend

### Dependencies
Express: Web application framework for Node.js.
cors: Middleware for enabling Cross-Origin Resource Sharing (CORS).
mysql2: MySQL client for Node.js.

### Installation

1. Install Nodejs
2. Verify using
   ```
   node -v
   mpm -v
   ```
3. Installation of typescript
   ```
   npm install -g typescript
   ```
4. Verification if typescript is installed
   ```
   tsc -v
   ```
5. Other dependencies I installed
   ```
   npm install express cors mysql2 body-parser
   npm install --save-dev typescript ts-node @types/node @types/express
   npm install --save-dev ts-node-dev
   ```

6. For running in development mode: 
   ```
   npm run dev
   ```

## Frontend

### Dependencies

- React: JavaScript library for building user interfaces.
- axios: Promise-based HTTP client for making API requests.
- react-router-dom: Routing library for React applications.

### Installation

To install the frontend dependencies, navigate to the `frontend` directory and run:

```bash
npm install
```

### Running the Frontend
npm start


# Database

1. Install docker
2. Pulling the mysql image
   ```
   docker pull mysql
   ```
   
3. Running the docker image for mysql:
   ```
   docker run --name my-mysql -e MYSQL_ROOT_PASSWORD=mypassword -d -p 3308:3306 mysql
   ```
5. Connecting to mysql
   ``` 
   mysql -h 127.0.0.1 -P 3308 -u root -p
   ```
6. Database Setup that would be necessary to have the app running
   ```
   CREATE DATABASE burrito_shop;

   CREATE TABLE burritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    price DECIMAL(10, 2)
    );
   
    CREATE TABLE orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      total_cost DECIMAL(10, 2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE orders ADD COLUMN preparation_status BOOLEAN DEFAULT 0;
       
    CREATE TABLE order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      burrito_id INT,
      quantity INT,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (burrito_id) REFERENCES burritos(id)
    );
    
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('employee', 'customer') NOT NULL
    );
    
    CREATE TABLE burrito_options (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      additional_cost DECIMAL(10, 2) DEFAULT 0.00
    );

     CREATE TABLE burrito_burrito_options (
    burrito_id INT,
    option_id INT,
    FOREIGN KEY (burrito_id) REFERENCES burritos(id),
    FOREIGN KEY (option_id) REFERENCES burrito_options(id),
    PRIMARY KEY (burrito_id, option_id)
    );

   INSERT INTO burrito_options (name, additional_cost) VALUES 
    ('Black Olives', 0.50),
    ('Rice', 0.30),
    ('Sour Cream', 0.40),
    ('Cheese', 0.50),
    ('Guacamole', 1.00);

   INSERT INTO users (username, password, role) VALUES ('testuser', 'plaintextpassword', 'employee');

   INSERT INTO burritos (name, size, price) VALUES ('Chicken Burrito', 'Regular', 3.00);

    INSERT INTO burritos (name, size, price) VALUES 
    ('Beef Burrito', 'Regular', 4.00),
    ('Veggie Burrito', 'Regular', 3.50),
    ('Pork Burrito', 'Regular', 4.50),
    ('Chicken Burrito', 'XL', 5.00),
    ('Beef Burrito', 'XL', 6.00),
    ('Veggie Burrito', 'XL', 5.50),
    ('Pork Burrito', 'XL', 6.50);
  
   ```
