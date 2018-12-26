const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs-then')
const Account = require('../shema')

function signToken(reqPassword, account) {
  return bcrypt.compare(reqPassword, account.password)
    .then(isValid => {
      if (isValid) {
        account.token = jwt.sign({ username: account.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return account;
      } else return Promise.reject(new Error('Credentials do not match.'))
    });
}

module.exports = function logInUser(reqBody) {
  return Account.findOne({ username: reqBody.username })
    .then(account =>
      !account
        ? Promise.reject(new Error('User with this username does not exit.'))
        : signToken(reqBody.password, account)
    )
    .then(account => ({
      success: true,
      err: null,
      token: account.token,   
      id: user._id,
      movies: account.movies
    }))
    // .catch(err => ({
    //    success: false,
    //    err: err.message,
    //    token: null,
    //    movies: null
    //  }))  
}