# Burrito-app

# Burrito Shop Project

## Description

This project is a Burrito Shop application with frontend, backend, and a MySQL database. It allows users to view a menu of burritos, create orders, and view order details.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Frontend](#frontend)
- [Backend](#backend)
- [Database](#database)
- [Running the Project](#running-the-project)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine.
- Docker installed to run the MySQL database in a container.

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

## Backend

### Dependencies
Express: Web application framework for Node.js.
cors: Middleware for enabling Cross-Origin Resource Sharing (CORS).
mysql2: MySQL client for Node.js.

### Installation

npm install

## Running the Backend
npm start

# Database

docker run --name my-mysql -e MYSQL_ROOT_PASSWORD=mypassword -d -p 3308:3306 mysql
