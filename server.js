const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

const { User } = require('./db/models');
const sequelize = require('./db/db');

const exphbs = require('express-handlebars');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hbs = exphbs.create({ defaultLayout: 'main' });

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

// Define a route for the root URL to render homepage.handlebars
app.get('/', (req, res) => {
  res.render('homepage');
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const user = await User.create({ name, email, password });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
}

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
});
