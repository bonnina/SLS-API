const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs-then')
const Account = require('../shema')

function signToken(reqPassword, account) {
  return bcrypt.compare(reqPassword, account.password)
    .then(isValid => 
      !isValid
        ? Promise.reject(new Error('Credentials do not match.'))
        : jwt.sign({ username: account.username }, process.env.JWT_SECRET, { expiresIn: '1d' })
    )
}

module.exports = function logInUser(reqBody) { 
  let acc;
  return Account.findOne({ username: reqBody.username })
    .then(account => {
      acc = account;
      return !account
        ? Promise.reject(new Error('User with this username does not exit.'))
        : signToken(reqBody.password, account)
    })
    .then(tkn => ({
      success: true,
      err: null,
      token: tkn,   
      id: acc._id,
      movies: acc.movies
    }))
    .catch(err => ({
      success: false,
      err: err.message,
      token: null,
      movies: null
    }))  
}