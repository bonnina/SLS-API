const express = require('express')
const router = express.Router()
const Account = require('../shema')
const registerUser = require('../methods/registerUser')
const logInUser = require('../methods/logInUser')
const jwt = require('jsonwebtoken')

router.post('/signup', (req, res, next) => { 
  registerUser(req.body)
  .then(result => {
    res.send(result)
  })
  .catch(err =>
    res(err.statusCode || 500).send(err.message)
  )
})

router.post('/login', (req, res, next) => {
  logInUser(req.body)
  .then(result => {
    res.status(201).send(result)
  })
  .catch(err =>
    res(err.statusCode || 500).send(err.message)
  )
})

router.put('/:id', (req, res, next) => {
  const token = req.body.token;

  return new Promise((resolve, reject) => {
    if (!token)
      reject(new Error('No token provided'))

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        reject(new Error('Token is not valid'))
        
      resolve(Account.findByIdAndUpdate(
        req.params.id,
        { $set: { movies: req.body.movies }}, 
        { $upsert: true, new: true }) 
      )
    })
  })
  .then(acc => ({
    success: true,
    err: null,
    token: token,  
    movies: acc.movies
  }))
  .then(result => 
    res.status(200).send(result)
  )
  .catch(err => 
    res.status(err.statusCode || 401).send(err.message)
  );
})

router.delete('/:id', (req, res, next) => {
  const token = req.body.token;

  return new Promise((resolve, reject) => {
    if (!token)
      reject(new Error('No token provided'))

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        reject(new Error('Token is not valid'))

      resolve(Account.update( { _id: req.params.id }, { $unset: { movies: "" }}) )
    })
  })
  .then(() => {
    res.status(200).send({
      success: true,
      err: null,
      token: token, 
      movies: []
    }) 
  })
  .catch(err => 
    res.status(err.statusCode || 401).send(err.message)
  );
})

module.exports = router
