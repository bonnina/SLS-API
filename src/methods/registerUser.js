const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs-then')
const Account = require('../shema')

function signToken(name) {
  return jwt.sign({ username: name }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

module.exports = function registerUser(reqBody) {
  const salt = 10;
  return  Account.findOne({ username: reqBody.username }) 
    .then(user =>
      user
        ? Promise.reject(new Error('User with this name already exists.'))
        : bcrypt.hash(reqBody.password, salt)
    )
    .then(hash =>
      Account.create({ username: reqBody.username, password: hash }) 
    )
    .then(user => ({
      success: true,
      err: null,
      token: signToken(user.username),  
      id: user._id,
      movies: []
    }))
    .catch(err => ({
      success: false,
      err: err.message,
      token: null,
      movies: null
    }))
}