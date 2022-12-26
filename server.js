const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const pool = require('./dbConfig');

const bcrypt = require('bcrypt');

const session = require('express-session');
// const uuid = require('uuid').v4;
const pgSession = require('connect-pg-simple')(session);

const passport = require('passport');
require("dotenv").config();

const flash = require("express-flash");

const moment = require('moment');

const port = process.env.PORT || 3000;

const initializePassport = require('./passportConfig')
initializePassport(passport);

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || "session_secret",
  resave: false,
  saveUninitialized: false,
  // store: new pgSession({
  //   pool : pool,                // Connection pool
  //   createTableIfMissing: true,
  // }),
  // cookie: {maxAge: 1000*60*60, secure: true, sameSite: 'none'}
})
);
// Middleware to initialize the passport library below:
app.use(passport.initialize());

// Middleware to implement a session with passport below:
app.use(passport.session());

app.use(flash());



app.get('/', (request, response) => {
  response.render('index')
});

app.get('/users/register', checkAuthenticated, (req, res) => {
  res.render('register');
});

app.get('/users/login', checkAuthenticated, (req, res) => {
  res.render('login');
});

app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {
  res.render('dashboard', {userName: req.user.first_name});
});

app.get('/users/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { 
      return next(err); 
      }
    req.flash('success_msg', 'You have logged out')
    res.redirect('/users/login');
  });
});


app.post('/users/register', async (req, res) => {
  let {firstName, lastName, email, password, password2} = req.body;

  console.log({
    firstName,
    lastName,
    email,
    password,
    password2
  });

  let errors = [];

  if (!firstName || !lastName || !email || !password || !password2) {
    errors.push({message: 'Please enter all fields'})
  }

  if (password.length < 6) {
    errors.push({message: 'Password should be at least 6 characters'})
  }

  if (password != password2) {
    errors.push({message: 'Passwords do not match'})
  }

  if (errors.length > 0) {
    res.render('register', {errors})
  } else {
    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword)

    pool.query(
      `SELECT * FROM users WHERE email = $1`, [email], (err, result) => {
        if(err) {
          throw err
        }
        console.log(result.rows);

        if(result.rows.length > 0) {
          errors.push({message: 'Email already registered'})
            res.render('register', {errors})
        } else {
          pool.query(`INSERT INTO users (password, email, first_name, last_name)
          VALUES ($1, $2, $3, $4) RETURNING user_id, email`, [hashedPassword, email, firstName, lastName], (err, result) => {
            if(err) {
              throw err
            }
            console.log(result.rows)
            req.flash("success_msg", "You are now registered. Please log in");
            res.redirect("/users/login");
          })
        }
      }
    )
  }
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })
);


function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

// Product routes
const productRouter = require('./Routes/productR');
app.use('/products',productRouter);

// Cart- product routes


// Create cart when user clicks on "Continue Shopping"
app.get('/create_cart',checkNotAuthenticated, (req, res) => { 
  const userId = req.user.user_id
    pool.query(`INSERT INTO carts (user_id) VALUES ($1) RETURNING *`, [userId], (err, result) => {
      if (err) {npm 
        throw err
      }
      const cart = result.rows[0];
      res.redirect("/select_products");
    })
})


app.get('/select_products',checkNotAuthenticated, (req, res) => { 
      res.render('products');
})

app.post('/select_products',checkNotAuthenticated, (req, res) => {
    const {productId, quantity} = req.body;
    const cartId = req.user.cart_id
    pool.query('INSERT INTO cart_items (product_id, quantity, cart_id) VALUES ($1, $2, $3) RETURNING *', [productId, quantity, cartId], (error, results) => {
      if (error) {
        throw error
      }
      res.status(201).send(`Cart_items was created with cart_id: ${results.rows[0].cart_id}`)
    })
  });

app.get('/carts/my_cart',checkNotAuthenticated, (req, res) => { 
  const cartId = req.user.cart_id
    pool.query(`SELECT * FROM cart_items WHERE cart_id =$1`, [cartId], (err, results) => {
      if (err) {
        throw err
      }
      res.status(201).send(results.rows)
    })
})

app.listen(port, () => {
  console.log(`App running on ${port}`)
});