//imports express framework 
const express = require('express');
const app = express();
const bodyParser = require('body-parser'); //used to parse through incoming messages
const request = require('request'); 


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function createRequest(url, path, method, params, query, body, callback){
    var statusCode;
    var data;
    const options = {
        uri: url,
        path: path,
        method: method,
        headers:{
            'Content-Type': 'application/json'
        },
        params: params,
        query: query,
        body: JSON.stringify(body)
    }
 
    //should default to method described in options 
    request(options)
    .on('error', function(error){
        statusCode = 501;
        data = {result:'error', msg:'Server unavailable'};
        callback(statusCode, data);
    })
    .on('response', function(response) {
        if(statusCode != 501) statusCode = (response.statusCode);
    })
    .on('data', function(data){
        if(statusCode != 501){
            //var data1 = JSON.parse(data);
            callback(statusCode, data);
        }
    });
}

//Catches all GET HTTP requests
app.get(/\/keyValue-store/, function (req, res) {
   var url = 'http://'+ process.env.MAINIP + '' + req.path;
   createRequest(url, req.path, 'GET', req.params, req.query, req.body, function(statusCode, data){
        res.status(statusCode).json(JSON.parse(data));
    });
});

//Catches all PUT HTTP requests
app.put(/\/keyValue-store/, function (req, res) {
    var url = 'http://'+ process.env.MAINIP + '' + req.path;
    createRequest(url, req.path, 'PUT', req.params, req.query, req.body, function(statusCode, data){
        res.status(statusCode).json(JSON.parse(data)); 
    });
});

//Catches all DELETE HTTP requests
app.delete(/\/keyValue-store/, function (req, res) {
    var url = 'http://'+ process.env.MAINIP + '' + req.path;
    createRequest(url, req.path, 'DELETE', req.params, req.query, req.body, function(statusCode, data){
        res.status(statusCode).json(JSON.parse(data)); 
    });
});

module.exports = app;

