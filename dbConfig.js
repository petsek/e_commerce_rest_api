const Pool = require('pg').Pool
require("dotenv").config();

const isProduction = process.env.NODE_ENW === "production";


const devConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

const prodConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized: false
    } 
}

const pool = new Pool(process.env.NODE_ENV === 'production' ? prodConfig : devConfig);

module.exports = pool

// From prevous project:
// const getUserById = (request, response) => {
//   const id = parseInt(request.params.id);
//   pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).json(results.rows)
//   })
// }

// const createUser = (request, response) => {
//   const {name, email} = request.body;
//   pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email], (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(201).send(`User was created with id: ${results.rows[0].id}`)
//   })
// };

// const updateUser = (request, response) => {
//   const {name, email} = request.body;
//   const id = parseInt(request.params.id);
//   pool.query('UPDATE users SET name = $1, email=$2 WHERE id = $3', [name, email, id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).send(`User was modified with id: ${id}`)
//   })
// };

// const deleteUser = (request, response) => {
//   const id = parseInt(request.params.id);
//   pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).send(`User was deleted with id: ${id}`)
//   })
// };

// module.exports = {
//   getUsers,
//   getUserById,
//   createUser,
//   updateUser,
//   deleteUser
// };

