//Contains function for /view endpoint

const express = require('express');
const router = express.Router({ caseSensitive: true });
const request = require('request');


require('dotenv').config();

//contains world view
var main_view = process.env.VIEW.split(",");


function getView(){
    return main_view;
}


//Creates HTTP request and returns response status code and data
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


    //Handels all http methods
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
            callback(statusCode, data);
        }
    });
}

function broadcastView(path, method, params, query, body, callback){
    for(let i = 0; i < main_view.length; i++){
        if((main_view[i] != process.env.IP_PORT)){
           createRequest('http://' + main_view[i] + '/view', path, method, params, query, body, callback);
        }
    }
}

//responds to endpoint /view returns view
router.get('/', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({view: main_view.toString().replace("\\[|\\]|\\s", "")});
});


//PUT checks if valid key
router.put('/', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	const ip_port = req.body.ip_port;
    const retVal = {};
    var code;
    //checks if ip_port is already in view else adds
    if(main_view.includes(ip_port)){
        retVal.result = 'Error';
        retVal.msg = ip_port + ' is already in the view';
        code = 404;
    }else{
        main_view.push(ip_port);
        retVal.result = 'Success';
        retVal.msg = 'Successfuly added ' + ip_port + ' to view';
        code = 200;
        //braodcast change
        broadcastView('/view', 'PUT', req.params, req.query, req.body, function(statusCode, data){
             //console.log(statusCode);
             //console.log(JSON.parse(data));
        });
    }
    res.status(code).json(retVal);
});


//DELETE a node from the view
router.delete('/', (req, res, next) => {

    res.setHeader('Content-Type', 'application/json');
	const ip_port = req.body.ip_port;
    const retVal = {};
    var code;

    //checks if ip_port is already in view else adds
    if(main_view.includes(ip_port)){
        main_view.splice( main_view.indexOf(ip_port), 1 );
        retVal.result = 'Success';
        retVal.msg = 'Successfully removed ' + ip_port + ' from view';
        code = 200;
        //broadcasts change
        broadcastView('/view', 'DELETE', req.params, req.query, req.body, function(statusCode, data){
             //console.log(statusCode);
             //console.log(JSON.parse(data));
        });
    }else{
        retVal.result = 'Error';
        retVal.msg = ip_port + ' is not in current view';
        code = 404;
    }
    res.status(code).json(retVal);
});


module.exports = {
    getView:getView,
    router:router
};
