import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import { OkPacket, RowDataPacket, ResultSetHeader } from 'mysql2';
import db from './database'; 
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
      user?: any;
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
    [username, password, role], // Note: Password right now is being stored as plaintext
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

      if (!Array.isArray(results) || results.length === 0) {
        return res.status(401).send('Incorrect username or password');
      }

      const user = results[0] as any;

      if (user.password !== password) {
        return res.status(401).send('Incorrect username or password');
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        'YOUR_SECRET_KEY', 
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

app.get('/api/burritos', (req, res) => {
  const query = `
    SELECT 
      b.id as burrito_id,
      b.name as burrito_name,
      b.size,
      b.price,
      GROUP_CONCAT(bo.name) as options
    FROM 
      burritos b
    LEFT JOIN 
      burrito_burrito_options bbo ON b.id = bbo.burrito_id
    LEFT JOIN 
      burrito_options bo ON bbo.option_id = bo.id
    GROUP BY 
      b.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving burritos with options from the database');
    } else {
      const formattedResults = (results as RowDataPacket[]).map(row => ({
        id: row.burrito_id,
        name: row.burrito_name,
        size: row.size,
        price: row.price,
        options: row.options ? row.options.split(',') : []
      }));
      
      res.json(formattedResults);
    }
  });
});


app.post('/api/orders', async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).send('Invalid order format');
  }

  try {
    let totalCost = 0;

    for (const item of items) {
      const [burritoRows] = await db.promise().query('SELECT price FROM burritos WHERE id = ?', [item.burrito_id]) as RowDataPacket[][];
      if (burritoRows.length > 0) {
        let burritoCost = burritoRows[0].price * item.quantity;

        for (const optionId of item.options) {
          const [optionRows] = await db.promise().query('SELECT additional_cost FROM burrito_options WHERE id = ?', [optionId]) as RowDataPacket[][];
          if (optionRows.length > 0) {
            burritoCost += optionRows[0].additional_cost * item.quantity;
          }
        }

        totalCost += burritoCost;
      }
    }

    const [insertOrderResult] = await db.promise().query('INSERT INTO orders (total_cost, preparation_status) VALUES (?, ?)', [totalCost, false]) as OkPacket[];
    const orderId = insertOrderResult.insertId;

    for (const item of items) {
      await db.promise().query('INSERT INTO order_items (order_id, burrito_id, quantity) VALUES (?, ?, ?)', [orderId, item.burrito_id, item.quantity]);
    }

    res.send({ message: 'Order created successfully', orderId: orderId });
  } catch (error) {
    console.error('Error in creating order:', error);
    res.status(500).send('Error creating order');
  }
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
          burrito_name: `${curr.burrito_name} (${curr.size})`, 
          quantity: curr.quantity
        });
  
        return acc;
      }, []);
  
      res.json(orders);
    }
  });
});


// Getting details for specific order
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;

  db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, results) => {
    if (err) {
      res.status(500).send('Error fetching order from database');
      return;
    }

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

      const itemsResults = itemResults as RowDataPacket[];

      res.json({ order: orderResults[0], items: itemsResults });
    });
  });
});

app.get('/api/burrito-options', (req, res) => {
  db.query('SELECT * FROM burrito_options', (err, results) => {
    if (err) {
      res.status(500).send('Error retrieving burrito options from database');
    } else {
      res.json(results);
    }
  });
});


// Route for marking an order as prepared
app.put('/api/orders/:id/prepared', (req, res) => {
  const orderId = req.params.id;

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

export default app;