const pool = require('../config');


const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY user_id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
};


const authenticateUser = ((email, password, cb) => {
  pool.query('SELECT user_id, email, password FROM users WHERE email=$1', [email], (err, result) => {
    if(err) {
      return cb(err)
    }
    if(result.rows.length > 0) {
      const first = result.rows[0]
      if (first.password = password) {
        cb(null, { user_id: first.user_id, email: first.email})
      } else  {
        cb(null, false)
      }
      // bcrypt.compare(password, first.password, function(err, res) {
      //   if(res) {
      //     cb(null, { user_id: first.user_id, email: first.email})
      //    } else {
      //     cb(null, false)
      //    }
      //  })
     } else {
       cb(null, false)
     }
  })
})

const deserializeUser = (id, cb) => {
  pool.query('SELECT user_id, email FROM users WHERE user_id = $1', [parseInt(id, 10)], (err, results) => {
    if(err) {
      return cb(err)
    }

    cb(null, results.rows[0])
  })
}

const login = (request, response) => {
  const {user} = request
  response.json(user)
}

module.exports = {
  getUsers,
  authenticateUser,
  deserializeUser,
  login
}