import mysql from 'mysql2';

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root', // replace with your MySQL username
  password: 'my-secret-pw', // replace with your MySQL password
  database: 'burrito_shop', 
  port: 3308
});

export default connection;
