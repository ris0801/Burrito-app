import mysql from 'mysql2';

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'my-secret-pw',
  database: 'burrito_shop', 
  port: 3308
});

export default connection;
