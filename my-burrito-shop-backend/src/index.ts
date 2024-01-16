import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from './database'; // Import the database connection
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface OrderItem {
  burrito_name: string;
  quantity: number;
}

interface Order {
  order_id: number;
  total_cost: number;
  items: OrderItem[];
}

declare global {
  namespace Express {
    interface Request {
      user?: any; // You can define a more specific type for user if needed
    }
  }
}


const app = express();
app.use(cors());
app.use(express.json());
const port = 3001;



app.post('/api/register', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).send('Username, password, and role are required');
  }

  // Insert the new user into the database with plain text password
  db.query(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, password, role], // Store the password as plain text
    (err, results) => {
      if (err) {
        return res.status(500).send('Error registering new user');
      }
      res.status(201).send('User registered successfully');
    }
  );
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, results: RowDataPacket[] | RowDataPacket[][]) => {
      if (err) {
        return res.status(500).send('Error logging in user');
      }

      // Check if results is an array and has at least one element
      if (!Array.isArray(results) || results.length === 0) {
        return res.status(401).send('Incorrect username or password');
      }

      const user = results[0] as any; // Cast the first element to 'any'

      // Directly compare the plain text passwords
      if (user.password !== password) {
        return res.status(401).send('Incorrect username or password');
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        'YOUR_SECRET_KEY', // Replace with your secret key
        { expiresIn: '1h' }
      );

      res.json({ token });
    }
  );
});

const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, 'YOUR_SECRET_KEY', (err: Error | null, user: any) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Route to list all burrito products
app.get('/api/burritos', (req, res) => {
  db.query('SELECT * FROM burritos', (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving data from database');
    } else {
      res.json(results);
    }
  });
});

// Route for creating a new order (without authentication for now)
app.post('/api/orders', authenticateJWT ,(req, res) => {
  const { total_cost, items, apiKey } = req.body;

  // Check if items array is valid
  if (!Array.isArray(items) || items.some(item => typeof item.burrito_id !== 'number' || typeof item.quantity !== 'number')) {
    return res.status(400).send('Invalid order items');
  }

  db.getConnection((err, connection) => {
    if (err) {
      res.status(500).send('Error connecting to the database');
      return;
    }
    
    connection.beginTransaction(err => {
      if (err) {
        res.status(500).send('Error starting transaction');
        return;
      }

      connection.query(
        'INSERT INTO orders (total_cost, preparation_status) VALUES (?, ?)', 
        [total_cost, false], // Set preparation_status to false for new orders
        (err, results) => {
          if (err) {
            return connection.rollback(() => {
              res.status(500).send('Error inserting order');
            });
          }

          const insertResult = results as ResultSetHeader;
          const orderId = insertResult.insertId;

          const orderItemsQueries = items.map(item => {
            return new Promise<void>((resolve, reject) => {
              connection.query(
                'INSERT INTO order_items (order_id, burrito_id, quantity) VALUES (?, ?, ?)', 
                [orderId, item.burrito_id, item.quantity], 
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          });

          Promise.all(orderItemsQueries)
            .then(() => {
              connection.commit(err => {
                if (err) {
                  return connection.rollback(() => {
                    res.status(500).send('Error committing transaction');
                  });
                }
                res.send('Order created successfully');
              });
            })
            .catch(err => {
              connection.rollback(() => {
                res.status(500).send('Error inserting order items');
              });
            });
        }
      );
    });
  });
});

app.get('/api/orders', (req, res) => {
  const query = `
    SELECT 
    o.id as order_id, 
    o.total_cost, 
    oi.quantity, 
    b.name as burrito_name,
    b.size
  FROM 
    orders o
  JOIN 
    order_items oi ON o.id = oi.order_id
  JOIN 
    burritos b ON oi.burrito_id = b.id
  WHERE 
    o.preparation_status = FALSE;
  `;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving orders from database');
    } else {
      const ordersData = results as RowDataPacket[];
  
      const orders = ordersData.reduce((acc: Order[], curr: any) => {
        let order = acc.find(o => o.order_id === curr.order_id);
        if (!order) {
          order = {
            order_id: curr.order_id,
            total_cost: curr.total_cost,
            items: []
          };
          acc.push(order);
        }

        order.items.push({
          burrito_name: `${curr.burrito_name} (${curr.size})`, // Combine name and size
          quantity: curr.quantity
        });
  
        return acc;
      }, []);
  
      res.json(orders);
    }
  });
});


// Route to fetch details of a specific order
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;

  db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, results) => {
    if (err) {
      res.status(500).send('Error fetching order from database');
      return;
    }

    // Type assertion here
    const orderResults = results as RowDataPacket[];

    if (orderResults.length === 0) {
      res.status(404).send('Order not found');
      return;
    }

    db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId], (err, itemResults) => {
      if (err) {
        res.status(500).send('Error fetching order items from database');
        return;
      }

      // Type assertion here
      const itemsResults = itemResults as RowDataPacket[];

      res.json({ order: orderResults[0], items: itemsResults });
    });
  });
});

// Route for marking an order as prepared (without authentication for now)
app.put('/api/orders/:id/prepared', (req, res) => {
  const orderId = req.params.id;

  // Update the 'preparation_status' of the order to 'prepared'
  db.query('UPDATE orders SET preparation_status = true WHERE id = ?', [orderId], (err, results: ResultSetHeader) => {
    if (err) {
      res.status(500).send('Error marking order as prepared');
    } else if (results.affectedRows === 0) {
      res.status(404).send('Order not found');
    } else {
      res.send('Order marked as prepared');
    }
  });
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
