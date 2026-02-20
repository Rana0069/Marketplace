require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult, query } = require('express-validator');
const { getDb } = require('./db');
const { authMiddleware } = require('./middleware');

const app = express();
app.use(cors());
app.use(express.json());

const authValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars')
];

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

app.post('/auth/register', [...authValidation, body('name').notEmpty()], async (req, res) => {
  if (!handleValidation(req, res)) return;
  const db = await getDb();
  const { name, email, password } = req.body;

  const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.run(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  const token = jwt.sign({ id: result.lastID, email }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '1d'
  });

  return res.status(201).json({ token, user: { id: result.lastID, name, email } });
});

app.post('/auth/login', authValidation, async (req, res) => {
  if (!handleValidation(req, res)) return;
  const db = await getDb();
  const { email, password } = req.body;

  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '1d'
  });

  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get(
  '/products',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  async (req, res) => {
    if (!handleValidation(req, res)) return;
    const db = await getDb();
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 6);
    const offset = (page - 1) * limit;
    const q = req.query.search ? `%${req.query.search}%` : '%';

    const totalRow = await db.get(
      'SELECT COUNT(*) as total FROM products WHERE title LIKE ? OR description LIKE ?',
      [q, q]
    );
    const products = await db.all(
      `SELECT p.*, CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as isFavorite
       FROM products p
       LEFT JOIN favorites f ON p.id = f.product_id AND f.user_id = ?
       WHERE p.title LIKE ? OR p.description LIKE ?
       ORDER BY p.id DESC
       LIMIT ? OFFSET ?`,
      [req.user?.id || 0, q, q, limit, offset]
    );

    return res.json({
      data: products,
      pagination: {
        page,
        limit,
        total: totalRow.total,
        totalPages: Math.ceil(totalRow.total / limit)
      }
    });
  }
);

app.get('/products/:id', async (req, res) => {
  const db = await getDb();
  const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.json(product);
});

app.post(
  '/products',
  authMiddleware,
  [body('title').notEmpty(), body('price').isFloat({ min: 0 }), body('description').notEmpty()],
  async (req, res) => {
    if (!handleValidation(req, res)) return;
    const db = await getDb();
    const { title, price, description, image } = req.body;
    const result = await db.run(
      'INSERT INTO products (title, price, description, image) VALUES (?, ?, ?, ?)',
      [title, price, description, image || null]
    );
    const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [result.lastID]);
    return res.status(201).json(newProduct);
  }
);

app.put(
  '/products/:id',
  authMiddleware,
  [body('title').notEmpty(), body('price').isFloat({ min: 0 }), body('description').notEmpty()],
  async (req, res) => {
    if (!handleValidation(req, res)) return;
    const db = await getDb();
    const { title, price, description, image } = req.body;
    const result = await db.run(
      'UPDATE products SET title = ?, price = ?, description = ?, image = ? WHERE id = ?',
      [title, price, description, image || null, req.params.id]
    );
    if (!result.changes) return res.status(404).json({ message: 'Product not found' });
    const updated = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    return res.json(updated);
  }
);

app.delete('/products/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  const result = await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
  if (!result.changes) return res.status(404).json({ message: 'Product not found' });
  return res.status(204).send();
});

app.post('/products/:id/favorite', authMiddleware, async (req, res) => {
  const db = await getDb();
  const product = await db.get('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  await db.run('INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)', [
    req.user.id,
    req.params.id
  ]);

  return res.status(200).json({ message: 'Added to favorites' });
});

app.delete('/products/:id/favorite', authMiddleware, async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [
    req.user.id,
    req.params.id
  ]);
  return res.status(200).json({ message: 'Removed from favorites' });
});

app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
