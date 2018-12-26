const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const helmet = require('helmet')
const routes = require('./routes')
require('./db') 

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use('/', routes)

module.exports = app