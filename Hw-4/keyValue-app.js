//Import frameworks

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const keyValue_store = require('./api/routes/keyValue-store');
const view = require('./api/routes/view');
const shard = require('./api/routes/shard');
const kvs_module = require('./api/data/keyValue-store-backend');
const shard_module = require('./api/data/shards-backend');
console.log('in app'); //----------------------
function checkKey(key){
    key_shardID = kvs_module.hashKey(key);
    ip_shardID = kvs_module.getShardsID(process.env.IP_PORT);
    return key_shardID == ip_shardID;
}

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



app.get('keyValue-store/:key', function(req, res, next){

    var key_shardID = kvs_module.hashKey(req.params.key);
    var ip_shardID = kvs_module.getShardsID(process.env.IP_PORT);

    if(checkKey(req.params.key)){
        return next();
    }

    var shard_IP = shards_module.getRandomMember(key_shardID);
    var url = 'http://'+  shard_IP + '' + req.path;
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
    request(options)
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

app.get('keyValue-store/search/:key', function(req, res, next){

    var key_shardID = kvs_module.hashKey(req.params.key);
    var ip_shardID = kvs_module.getShardsID(process.env.IP_PORT);

    if(checkKey(req.params.key)){
        return next();
    }

    var shard_IP = shards_module.getRandomMember(key_shardID);
    var url = 'http://'+  shard_IP + '' + req.path;
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
    request(options)
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

app.put('keyValue-store/:key', function(req, res, next){

    var key_shardID = kvs_module.hashKey(req.params.key);
    var ip_shardID = kvs_module.getShardsID(process.env.IP_PORT);

    if(checkKey(req.params.key)){
        return next();
    }

    var shard_IP = shards_module.getRandomMember(key_shardID);
    var url = 'http://'+  shard_IP + '' + req.path;
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
    request(options)
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

app.delete('keyValue-store/:key', function(req, res, next){

    var key_shardID = kvs_module.hashKey(req.params.key);
    var ip_shardID = kvs_module.getShardsID(process.env.IP_PORT);

    if(checkKey(req.params.key)){
        return next();
    }

    var shard_IP = shards_module.getRandomMember(key_shardID);
    var url = 'http://'+  shard_IP + '' + req.path;
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


    //send http request and catches response
    request(options)
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

app.use(/\/keyValue-store/, keyValue_store);
app.use(/\/view/, view);
app.use(/\/shard/, shard);

module.exports = app;
