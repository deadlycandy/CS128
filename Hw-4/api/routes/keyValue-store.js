//Contains functions for /keyValue-store endpoints

const express = require('express');
const router = express.Router({ caseSensitive: true });
const request = require('request');
const vector = require('../vector/vector');
const version = require('../vector/version');
const kvs = require('../data/keyValue-store-backend');
const view_module = require('../data/view-backend');
//const shards = require('../data/shards-backend');

var curr_shardsNum = process.env.S;
var curr_shardID;


//Creates HTTP request and returns response status code and data
function createRequest(url, path, method, params, body, callback){
    var statusCode;
    var data;
    var l_url = url;
    var l_path = path;
    var l_method = method;
    var l_params = params;
    var l_body = body;
    var l_callback = callback;

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
        if(error.statusCode >= 500){
            statusCode = 501;
            data = {result:'error', msg:'Server unavailable'};
            callback(statusCode, data);
        }else{
            createRequest(l_url, l_path, l_method, l_params, l_body, l_callback);
        }
        // call function again to resend HTTP request WIP
        //l_ variables contain original request parameters
        //--------------- this keeps sending to every node till it gets response from each oneg
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


function broadcastUpdate(views, path, method, params, body, callback){
    for(let i = 0; i < views.length; i++){
        if(views[i] != process.env.IP_PORT){
           createRequest('http://' + views[i] + '/keyValue-store'+ path, path, method, params, body, callback);
        }
    }
}

//will be implictly triggered when the view or number of shards has changed. Dependent on view gossip
// function validShards(){
//     console.log(shards.getShards())
//     var new_shardsNum = shards.getAllIDS();
//     if(view_module.getMain_view().length >= 2 && (shards.invalidShards() || curr_shardsNum != new_shardsNum)){
//         curr_shards = new_shardsNum;
//         var numberOfShards = shards.getValidNumShards();
//         shards.makeShard(numberOfShards);
//         var kvsList = kvs.shardKVS();
//         for(let i; i < kvsList.length; i++){
//             var members = shards.getMembers(i);
//             broadcastUpdate(members, '/kvsShards','PUT', '', {kvs:kvsList[i], worldClock: kvs.getWorldClock()}, function(statusCode, data){
//                 //catchest status code and returned data
//             });
//         }
//     }
// }
//
// setInterval(validShards, 300);

//refactor and update to local view
function bootstrapKey(key, view){
    var store = kvs.getStore();
    var timestamps = Object.keys(store[key]);
    for(let i = 0; i < timestamps.length; i++){
        createRequest('http://' + view + '/keyValue-store/broadcast/' + key, '/broadcast',
            'PUT', '', store[key][timestamps[i]], function(statusCode, data){
         });
    }
}

function gossip(){
    console.log(shards.getShards())
    var member = shards.getRandomMember(shards.getShardsID(process.env.IP_PORT));
    var key = kvs.getRandomKey();
    if(key != undefined){
        bootstrapKey(key, member);
    }
}

setInterval(gossip, 500);

//--Rework to local nodes --optimize to check if view is different then perform computation WIP
function bootstrap(){
    console.log(shards.getShards())
    //update to local view (shard view)
    var new_shardID = shards.getShardsID(process.env.IP_PORT);
    curr_shardID = curr_shardID != new_shardID ? new_shardID : curr_shardID;

    var newViews = view_module.getViewDiff();
    //this will remove the new views if they arenn't part of the current shard
    shards.removeInvalidIPs(newViews);

    for(key in newViews){
        var store = kvs.getStore();
        var keys = Object.keys(store);
        for(let i = 0; i < keys.length; i++){
            var timestamps = Object.keys(store[keys[i]]);
            for(let j = 0; j < timestamps.length; j++){
                createRequest('http://' + newViews[key] + '/keyValue-store/broadcast/' + keys[i], '/broadcast',
                'PUT', '', store[keys[i]][timestamps[j]], function(statusCode, data){

                });
            }
        }
    }
}

setInterval(bootstrap, 500);


//PUT for kvs broadcasts
router.put('/gossip/:key', (req, res) => {
    const key = req.params.key;
    const payload =  req.body;
    const keyExists = kvs.keyExists(key, payload);


    if(keyExists){
        res.status(200).json({'msg': 'Already in KVS'});
    }else{
        //adding new keys and broadcast
        kvs.insertBootstrap(key, payload);
        res.status(201).json({'msg': 'Successfully added'});
    }

});

router.put('/kvsShards', (req, res) =>{
    // add kvs keys -------------------------------------
    var kvsKeys = req.body.kvs;
    var incomingClock = req.body.worldClock;

    kvs.merge(kvsKeys);
    kvs.purge();
    kvs.mergeWorldClock(incomingClock);
});



//------------------------------------------------------------------ EXTERNAL END POINTS ----------------------------------------------------

//responds to endpoint /subject returns value
router.get('/:key', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const key = req.params.key;
    const payload = req.body.payload == undefined  ? vector.makeVector(store) : JSON.parse(req.body.payload);
    var newestVer = kvs.searchNewestLocal(key, payload);

    const retVal = {};
    var code;

    //checks if key existed
    if(newestVer == undefined || newestVer.value ==  undefined) {
        retVal.msg = 'Key does not exist';
        retVal.result = 'Error';
        code = 404;
    }
    else if(newestVer){
        retVal.value = newestVer;
        retVal.result = 'Success';
        code = 200;
    }
    else{
        retVal.result = "Error";
        retVal.msg = "Payload out of date";
        code = 400;
    }

    //update payload by key
    kvs.updatePayload(key, payload);
    retVal.payload = JSON.stringify(payload);

    res.status(code).json(retVal);
});

//responds to endpoint /search/ returns boolean
router.get('/search/:key', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const key = req.params.key;
    const payload = req.body.payload == undefined  ? vector.makeVector(store) : JSON.parse(req.body.payload);
    const newestVer =  kvs.searchNewestLocal(key, payload);

    const retVal = {};
    var code;

    //checks if key existed
    if(newestVer == undefined || newestVer.value == undefined){
	    retVal.isExists = "False";
        retVal.result = 'Success';
        code = 200;
    }else if(newestVer) {
        retVal.isExists = "True";
        retVal.result = 'Sucess';
        code = 200;
    }else{
        retVal.result = "Error";
        retVal.msg = "Payload out of date";
        code = 400;
    }

    //updating payload by key
    kvs.updatePayload(key, payload);
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


    var newestVer = kvs.searchNewestLocal(key, payload);
    var didSubjectExist = false;

    //Input validation constraints
    const validKey = key.length > 0 && key.length <= 200 ? true : false;

    //Hash key and find

    if(validKey && data != null) {

        //checking if deleted or previously existed
        if(newestVer == undefined || newestVer.value == undefined
            || (!newestVer && newestVer.value == undefined)) {
            didSubjectExist = false;
        }else{
            didSubjectExist = true;
        }
        //inserting new value
        kvs.insertValue(key, data, payload);
        kvs.updatePayload(key, payload);

        retVal.payload = JSON.stringify(payload);
        const replaced = didSubjectExist ? true : false;
        retVal.replaced = replaced;
        retVal.msg = replaced ? 'Updated successfully' : 'Added successfully';
        code = didSubjectExist ? 201 : 200;

    }else{
        retVal.msg = 'Key not valid';
        retVal.result = 'Error';
        code = 422;
    }
    res.status(code).json(retVal);
});

//DELETE removes key from kvs -- WIP
router.delete('/:key', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const key = req.params.key;
    const payload = req.body.payload == undefined  ? vector.makeVector(store) : JSON.parse(req.body.payload);
    var newestVer = kvs.searchNewestLocal(key, payload);

    const retVal = {};
    var code;

    //checking if already deleted or does not exist
    if(newestVer == undefined || newestVer.value == undefined) {
        retVal.msg = 'Key does not exist';
        retVal.result = 'Error';
        code = 404;
    }
    else if(newestVer){ //deleted by setting value to undefined and increment key
        retVal.result = 'Success';
        retVal.msg = 'Key deleted'
        code = 200;
        kvs.insertValue(key, undefined, payload);
    }
    else{
        retVal.result = "Error";
        retVal.msg = "Payload out of date";
        code = 400;
    }

    //update payload by key
    kvs.updatePayload(key, payload);
    retVal.payload = JSON.stringify(payload);
    res.status(code).json(retVal);
});



module.exports = router;
