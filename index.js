// express setups
const express = require('express');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);
// route
const loginRoute = require('./routes/login');
const logoutRoute = require('./routes/logout');
//other
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Session
const KnexSessionStore = require('connect-session-knex')(session);

const Knex = require('knex');

//Local run
const knex = Knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: '123',
    database: 'ejournal',
  },
});

const store = new KnexSessionStore({
  knex,
  tablename: 'sessions', // optional. Defaults to 'sessions'
});

app.use(
  session({
    secret: 'EJOURNAL',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 10 * 60 * 60 * 1000,
    },
    store,
  })
);

const compression = require('compression');
app.use(compression());

app.use('/login', loginRoute);
app.use('/logout', logoutRoute);

async function checkUserSession(req, res, next) {
  try {
    if (req.session.user) {
      next();
    } else {
      res.status(400).json({ msg: 'Xin đăng nhập lại vào hệ thống' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}
app.use(checkUserSession);

server.listen(PORT, () => {
  console.log('Server running...');
});
