// import mysql from 'mysql2';

// const connection = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'my-secret-pw',
//   database: 'burrito_shop', 
//   port: 3308
// });

// export default connection;

import mysql from 'mysql2';

const connection = mysql.createPool({
  host: 'my-mysql-network', // Name of your MySQL Docker container
  user: 'root',
  password: 'mypassword', // Your MySQL root password
  database: 'burrito_shop', 
  port: 3306 // Make sure this port matches the MySQL container's port
});

export default connection;
