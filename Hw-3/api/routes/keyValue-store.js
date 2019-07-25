//Contains functions for /keyValue-store endpoints

const express = require('express');
const router = express.Router({ caseSensitive: true });
const request = require('request');
const vector = require('../vector/vector');
const version = require('../vector/version');
var view = require('./view');

//kvs
var store = {};

var worldClock = vector.makeVector(store);
var worldView = view.getView();


//Creates HTTP request and returns response status code and data
function createRequest(url, path, method, params, body, callback){
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


function bootstrapKey(key, view){
    var timestamps = Object.keys(store[key]);
    for(let i = 0; i < timestamps.length; i++){
        createRequest('http://' + view + '/keyValue-store/broadcast/' + key, '/broadcast',
            'PUT', '', store[key][timestamps[i]], function(statusCode, data){
                //console.log(statusCode);
                //console.log(data);
         });
    }
}


function broadcastUpdate(path, method, params, body, callback){
    var views = view.getView();
    for(let i = 0; i < views.length; i++){
        if(views[i] != process.env.IP_PORT){
           createRequest('http://' + views[i] + '/keyValue-store'+ path, path, method, params, body, callback);
        }
    }
}

function getRandomView(){

    var views = view.getView();
    if(views.length == 1) {
        return false;
    }
    var ip = views[Math.floor(Math.random() * views.length)];
    while(ip == process.env.IP_PORT) ip = views[Math.floor(Math.random() * views.length)];
    return ip;
}

function searchNewestLocal(key, versionVector) {

    if(!vector.hasNewerVersion(worldClock, versionVector, key)) {
        return false;
    }

    var newestVer = undefined;

    for(ver in store[key]) {
        var consideredVersion = store[key][ver];
        if(!newestVer) {
            newestVer = consideredVersion;

        }
        else {
            if(version.isLessThan(newestVer, consideredVersion) == 1) {
                newestVer = consideredVersion;
            }
        }
    }
    return newestVer ? newestVer.value : undefined;
}

//will return new views in an array
function areViewsDifferent(curr_view, worldView) {

    var arrayOfViews = [];

    for(let i = 0; i < curr_view.length; i++){
        if(!(worldView.includes(curr_view[i]))){
            arrayOfViews.push(curr_view[i]);
        }
    }

    return arrayOfViews;
}

function bootstrap(){
    var curr_view = view.getView();
    var newViews = areViewsDifferent(curr_view, worldView);
    for(let k = 0; k < newViews.length; k++){
        var keys = Object.keys(store);
        for(let i = 0; i < keys.length; i++){
            var timestamps = Object.keys(store[keys[i]]);
            for(let j = 0; j < timestamps.length; j++){
                createRequest('http://' + newViews[k] + '/keyValue-store/broadcast/' + keys[i], '/broadcast',
                'PUT', '', store[keys[i]][timestamps[j]], function(statusCode, data){
                    //console.log(statusCode);
                    //console.log(data);
                });
            }
        }
    }
    worldView = [];
    for(key in curr_view) {
        worldView.push(curr_view[key]);
    }
}

setInterval(bootstrap, 1000);


//PUT for kvs broadcasts
router.put('/broadcast/:key', (req, res) => {
    const key = req.params.key;
    const payload =  req.body;
    const keyExists = (key in store);


    if(keyExists && payload.timestamp in store[key] && vector.isExactlyEqual(worldClock,payload.versionVector)){
        res.status(200).json({'msg': 'Already in KVS'});
    }else{
        //adding new keys and broadcast
        vector.takeMaxKey(worldClock, payload.versionVector, key);

        if(!(key in store)) store[key] = {};
        store[key][payload.timestamp] = payload;


        broadcastUpdate('/broadcast/' + key, 'PUT', req.params, payload, function(statusCode, data){
            //console.log(statusCode);
            //console.log(JSON.parse(data));
        });

        var ip = getRandomView();
        if(ip) {
            bootstrapKey(key, getRandomView());
        }

        res.status(201).json({'msg': 'Successfully added'});
    }

});



//------------------------------------------------------------------ EXTERNAL END POINTS ----------------------------------------------------

//responds to endpoint /subject returns value
router.get('/:key', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const key = req.params.key;
    const payload = req.body.payload == undefined  ? vector.makeVector(store) : JSON.parse(req.body.payload);
    var newestVer = searchNewestLocal(key, payload);
    const retVal = {};
    var code;

    if(newestVer == undefined) {
        retVal.msg = 'Key does not exist';
        retVal.result = 'Error';
        code = 404;
    }
    else if(key in store && newestVer){
        retVal.value = newestVer;
        retVal.result = 'Success';
        code = 200;
    }
    else if(newestVer == false) {
        retVal.result = "Error";
        retVal.msg = "Payload out of date";
        code = 400;
    }

    vector.takeMaxKey(payload, worldClock, key);
    retVal.payload = JSON.stringify(payload);

    res.status(code).json(retVal);
});

//responds to endpoint /search/ returns boolean
router.get('/search/:key', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const key = req.params.key;
    const payload = req.body.payload == undefined  ? vector.makeVector(store) : JSON.parse(req.body.payload);
    const newestVer =  searchNewestLocal(key, payload);

    const retVal = {};
    var code;

    if(newestVer == undefined){
	    retVal.isExists = "False";
        retVal.result = 'Success';
        code = 200;
    }else if(key in store && newestVer) {
        retVal.isExists = "True";
        retVal.result = 'Sucess';
        code = 200;
    }else if(newestVer == false) {
        retVal.result = "Error";
        retVal.msg = "Payload out of date";
        code = 400;
    }

    vector.takeMaxKey(payload, worldClock, key);
    retVal.payload = JSON.stringify(payload);
    res.status(code).json(retVal);

});

//PUT checks if valid key
router.put('/:key', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
    const retVal = {};
    var code;

	const key = req.params.key;
	const data = req.body.val;
    const payload = req.body.payload == undefined ? vector.makeVector(store) : JSON.parse(req.body.payload);

	//Input validation constraints
    const validKey = key.length > 0 && key.length <= 200 ? true : false;

	if(validKey && data != null) {
        // Update KVS and world clock
        vector.takeMaxKey(worldClock, payload, key);

        var newData = version.makeNextVersion(key, data, worldClock);

        vector.incrementKey(worldClock, key);

	var newestVer = searchNewestLocal(key, payload);

        var didSubjectExist = false;
    	if(newestVer == undefined) {
		didSubjectExist = false;
	}
	else if(key in store && newestVer) {
		didSubjectExist = true;
	}
	else if(newestVer == false) {
		didSubjectExist = true;
	}

        const replaced = didSubjectExist ? true : false;


        if(!(key in store)) store[key] = {};
        store[key][newData.timestamp] = newData;

       	retVal.replaced = replaced;
	    retVal.msg = replaced ? 'Updated successfully' : 'Added successfully';


        vector.takeMaxKey(payload, worldClock, key);
        retVal.payload = JSON.stringify(payload);

        code = didSubjectExist ? 201 : 200;
        broadcastUpdate('/broadcast/' + key, 'PUT', req.params, newData, function(statusCode, data){
            //console.log(statusCode);
            //console.log(JSON.parse(data));
        });

    }else{
        retVal.msg = 'Key not valid';
		retVal.result = 'Error';
		code = 422;
	}
    res.status(200).json(retVal);
});


//DELETE removes key from kvs
router.delete('/:key', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const key = req.params.key;
    const payload = req.body.payload == undefined  ? vector.makeVector(store) : JSON.parse(req.body.payload);
    var newestVer = searchNewestLocal(key, payload);

    const retVal = {};
    var code;

    if(newestVer == undefined) {
        retVal.msg = 'Key does not exist';
        retVal.result = 'Error';
        code = 404;
    }
    else if(key in store && newestVer){
        retVal.result = 'Success';
        retVal.msg = 'Key deleted'
        code = 200;

        // Update KVS and world clock
        vector.takeMaxKey(worldClock, payload, key);

        //console.log(worldClock);

        var newData = version.makeNextVersion(key, undefined, worldClock);

        vector.incrementKey(worldClock, key);

        store[key][newData.timestamp] = newData;


        //broadcasts kvs delete
        broadcastUpdate('/broadcast/'+ key, 'PUT', req.params, newData, function(statusCode, data){
            //console.log(statusCode);
            //console.log(JSON.parse(data));
        });

    }
    else if(newestVer == false) {
        retVal.result = "Error";
        retVal.msg = "Payload out of date";
        code = 400;
    }

    vector.takeMaxKey(payload, worldClock, key);
    retVal.payload = JSON.stringify(payload);

    res.status(code).json(retVal);
});



module.exports = router;
