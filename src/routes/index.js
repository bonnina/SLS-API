const express = require('express')
const router = express.Router()
const fs = require("fs")
const jwt = require('jsonwebtoken')
const Account = require('../shema')
const registerUser = require('../methods/registerUser')
const logInUser = require('../methods/logInUser')

router.post('/signup', (req, res, next) => { 
  registerUser(req.body)
  .then(result => res.send(result))
  .catch(err => res(err.statusCode || 500).send(err.message))
})

router.post('/login', (req, res, next) => {
  logInUser(req.body)
  .then(result => res.status(201).send(result))
  .catch(err => res(err.statusCode || 500).send(err.message))
})

router.put('/:id', (req, res, next) => {
  const token = req.body.token;

  return new Promise((resolve, reject) => {
    if (!token)
      reject(new Error('No token provided'))

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        reject(new Error('Token is not valid'))
        
      resolve(Account.findByIdAndUpdate(req.params.id, { $set: { movies: req.body.movies }}, { $upsert: true, new: true }))
    })
  })
  .then(acc => ({
    success: true,
    err: null,  
    movies: acc.movies
  }))
  .then(result => res.status(200).send(result))
  .catch(err => res.status(err.statusCode || 401).send(err.message))
})

router.post('/:id', function (req, res, next) {
  if (!req.files)
    res.status(400).send('No files were uploaded.')
  else {
    const file = req.files.file;
  
    return new Promise((resolve, reject) => {
      file.mv('./movies.txt', function (err) {
        if (err) return res.status(500).send('error')
        resolve();
      })
    })
      .then(() => {
        fs.readFile('./movies.txt', 'utf8', function (error, data) {
          if (error) throw error;

          const str = data.toString();
          const arr = str.split('\n\n').map(el => el.split('\n'));
        
          let objectify = function (el) {
            return new Promise((resolve) => {
              let movie = el.map(line => line.split(': '));
              resolve({
                "title": movie[0][1],
                "year": movie[1][1],
                "format": movie[2][1],
                "stars": [...movie[3][1].split(', ')]
              })
            })
          };

          let actions = arr.map(objectify);
          Promise.all(actions)
          .then(data => 
            Account.findByIdAndUpdate( req.params.id, { $set: { movies: data }}, { $upsert: true, new: true }) 
          )
          .then(acc => ({
            success: true,
            err: null,  
            movies: acc.movies
          }))
          .then(result => res.status(200).send(result))
        })
      })
      .catch(err => res.status(err.statusCode || 401).send(err.message))
    }
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
      movies: []
    }) 
  })
  .catch(err => 
    res.status(err.statusCode || 401).send(err.message)
  );
})

module.exports = router
