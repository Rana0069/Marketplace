const bcrypt = require('bcryptjs');
const { getDb } = require('../src/db');

async function seed() {
  const db = await getDb();

  await db.exec('DELETE FROM favorites; DELETE FROM products; DELETE FROM users;');

  const users = [
    { name: 'Alice Demo', email: 'alice@example.com', password: 'password123' },
    { name: 'Bob Demo', email: 'bob@example.com', password: 'password123' }
  ];

  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    await db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [
      user.name,
      user.email,
      hash
    ]);
  }

  const products = [
    ['Handmade Tote Bag', 29.99, 'Eco-friendly cotton tote with vibrant print.', 'https://picsum.photos/seed/bag/400/300'],
    ['Ceramic Coffee Mug', 18.5, 'Minimal stoneware mug for coffee lovers.', 'https://picsum.photos/seed/mug/400/300'],
    ['Wireless Earbuds', 79.0, 'Compact earbuds with immersive sound.', 'https://picsum.photos/seed/earbuds/400/300'],
    ['Desk Plant', 15.0, 'Low-maintenance succulent in a ceramic pot.', 'https://picsum.photos/seed/plant/400/300'],
    ['Yoga Mat', 34.0, 'Non-slip yoga mat for home workouts.', 'https://picsum.photos/seed/yoga/400/300'],
    ['Smart Water Bottle', 49.0, 'Tracks hydration and glows to remind you.', 'https://picsum.photos/seed/bottle/400/300'],
    ['Leather Wallet', 42.25, 'Slim full-grain leather wallet.', 'https://picsum.photos/seed/wallet/400/300'],
    ['Bluetooth Speaker', 62.0, 'Portable speaker with deep bass.', 'https://picsum.photos/seed/speaker/400/300'],
    ['Notebook Set', 12.75, 'Pack of 3 premium hardcover notebooks.', 'https://picsum.photos/seed/notebook/400/300'],
    ['Running Cap', 22.0, 'Breathable cap with reflective trim.', 'https://picsum.photos/seed/cap/400/300']
  ];

  for (const [title, price, description, image] of products) {
    await db.run(
      'INSERT INTO products (title, price, description, image) VALUES (?, ?, ?, ?)',
      [title, price, description, image]
    );
  }

  console.log('Seed complete. Users: alice@example.com / password123, bob@example.com / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
