//Import frameworks

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const keyValue_store = require('./api/routes/keyValue-store');

//bodyParser limits request data size
app.use(bodyParser.urlencoded({limit: '1MB', extended: false}));
app.use(bodyParser.json({limit: '1MB'}));

//Catching bodyParser limit error 
app.use(function(error, req, res, next){
    const retVal = {};

    if(error.type == 'entity.too.large'){
        retVal.result = 'Error';
        retVal.msg = 'Object too large. Size limit is 1MB'; 
    }
    else{
        retVal.result = 'Error';
        retVal.msg = 'Bad Request';
    }

    res.status(400).json(retVal);
});

app.use(/\/keyValue-store/, keyValue_store);

module.exports = app;


