const express = require('express')
const router = express.Router()
const Account = require('../shema')
const registerUser = require('../methods/registerUser')
const logInUser = require('../methods/logInUser')
const jwt = require('jsonwebtoken')
const connectToDB = require('../db');

router.post('/signup', (req, res, next) => { 
  registerUser(req.body)
  .then(result => {
    console.log(result);
    res.status(201).send(result)
  })
  .catch(err =>
    res(err.statusCode || 500).send(err.message)
  );
})

router.post('/login', (req, res, next) => {
  logInUser(req.body)
  .then(result => {
    console.log(result);
    res.status(201).send(result)
  })
  .catch(err =>
    res(err.statusCode || 500).send(err.message)
  );
})

router.put('/:id', (req, res, next) => {
  const token = req.body.token;
  console.log(req.body.movies); // FIXME
  return connectToDB()
  .then(() => {
    if (!token)
      // return res.status(401); FIXME
      throw new Error('No token provided')

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        throw new Error('Token is not valid');
      return Account.findByIdAndUpdate(req.params.id, { $set: { movies: req.body.movies }}, { $upsert: true, new: true })
    })
  })
  .then(acc => ({
    success: true,
    err: null,
    token: token,  
    movies: acc.movies
  }))
  .then(result => {
    console.log(result);  // FIXME
    res.status(200).send(result)
  })
  .catch(err => 
    res.status(err.statusCode || 401).send(err.message)
  );
})

router.delete('/:id', (req, res, next) => {
  return connectToDB()
  .then(() => {
    const token = req.body.token;

    if (!token)
      //return res.status(401); FIXME
      throw new Error('No token provided')

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        throw new Error('Token is not valid');

      return Account.update( { _id: req.params.id }, { $unset: { movies: "" }} )
    })
  })
  .then(result => {
    console.log(result);  // FIXME
    res.status(200).send({
      success: true,
      err: null,
      token: token
    }) 
  })
  .catch(err => 
    res.status(err.statusCode || 401).send(err.message)
  );
})

router.get('/all', async (req, res, next) => {
  const all_accounts = await Account.find( {}, { password: 0 } );

  res.status(200).send(all_accounts);
})

module.exports = router