//imports express framework 
const express = require('express');
const app = express();
const bodyParser = require('body-parser'); //used to parse through incoming messages
const request = require('request'); 


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());



//catches all GET HTTP requests
app.get(/\/keyValue-store/, function (req, res) {


    var url = 'http://'+ process.env.MAINIP + '' + req.path;
    var statusCode;
   
    //Details requests parameters
    const options = {
        uri: url,
        path: req.path,
        method: 'GET',
        headers:{
            'Content-Type': 'application/json'
        },
        params: req.params,
        query: req.query,
        body: JSON.stringify(req.body),
    }
    
    //send http request and catches response
    request.get(options)
    .on('error', function(error){
        statusCode = 501;
        res.status(501).json({result:'error', msg:'Server unavailable'});
    })
    .on('response', function(response) {
        if(statusCode != 501) res.status(response.statusCode);
    })
    .on('data', function(data){
        if(statusCode != 501) res.json(JSON.parse(data));
    });
   
});

//Catches all PUT HTTP requests
app.put(/\/keyValue-store/, function (req, res) {
   
    var url = 'http://'+ process.env.MAINIP + '' + req.path;
    var statusCode;
   
    //Details requests parameters
    const options = {
        uri: url,
        path: req.path,
        method: 'PUT',
        headers:{
            'Content-Type': 'application/json'
        },
        params: req.params,
        query: req.query,
        body: JSON.stringify(req.body),
    }


    //send http request and catches response
    request.put(options)
    .on('error', function(error){
        statusCode = 501;
        res.status(501).json({result:'error', msg:'Server unavailable'});
    })
    .on('response', function(response) {
        if(statusCode != 501) res.status(response.statusCode);
    })
    .on('data', function(data){
         //console.log('app' + data);
        if(statusCode != 501) res.json(JSON.parse(data));
    });

});

//Catches all DELETE HTTP requests
app.delete(/\/keyValue-store/, function (req, res) {
  
    var url = 'http://'+ process.env.MAINIP + '' + req.path;
    var statusCode;
    
   
    //Details requests parameters
    const options = {
        uri: url,
        path: req.path,
        method: 'DELETE',
        headers:{
            'Content-Type': 'application/json'
        },
        params: req.params,
        query: req.query,
        body: JSON.stringify(req.body),
    }
    
    //send http requests and catches response 
    request.delete(options)
    .on('error', function(error){
        statusCode = 501;
        res.status(501).json({result:'error', msg:'Server unavailable'});
    })
    .on('response', function(response) {
        if(statusCode != 501) res.status(response.statusCode);
    })
    .on('data', function(data){
        //console.log('app' + data);
        if(statusCode != 501) res.json(JSON.parse(data));
    });


});

module.exports = app;

