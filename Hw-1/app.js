//imports express framework
const express = require('express');
const app = express();
const bodyParser = require('body-parser'); //used to parse through incoming messages

const helloRoutes = require('./api/routes/hello');
const testRoutes = require('./api/routes/test');

//extracts and urlencoded data.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());



//all messages will be filtered through use()

app.use(/\/hello/, helloRoutes);
app.use(/\/test/, testRoutes);


module.exports = app;

