//Contains function for /view endpoint

const express = require('express');
const router = express.Router({ caseSensitive: true });
const request = require('request');
const view_module = require('../data/view-backend');
const shard_module = require('../data/shards-backend');


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
    main_view = view_module.getMain_view();
    for(let i = 0; i < main_view.length; i++){
        if((main_view[i] != process.env.IP_PORT)){
           createRequest('http://' + main_view[i] + '/view', path, method, params, query, body, callback);
        }
    }
}

function gossip(){
    //pick a random view
    var ip_port = view_module.getRandomView();
    //send your view to internal PUT method
    createRequest('http://' + ip_port + '/gossip', '/gossip', 'PUT', '','',
    {view: view_module.getMain_view(), clock: view_module.getViewClock()},
    function(statusCode, data){
        //console.log(statusCode);
        //console.log(data);
    });
}

setInterval(gossip, 250);

router.put('/gossip', (req, res, next) => {
    //handle internal view gossip
    local_view = view_module.getMain_view();
    ip_view = req.body.view;
    ip_clock = req.body.clock;
    new_views = [];

    //check if your viewClock is newer
    if(view_module.getViewClock() > ip_clock){
        res.status(400);
    }

    //Finding what to add to view
    for (var i = 0; i < ip_view.length; i++) {
        if (local_view.indexOf(ip_view[i]) === -1) {
            view_module.insertView(ip_view[i]);
        }
     }

     //Finding what to delete from view
     for (var i = 0; i < local_view.length; i++) {
         if (ip_view.indexOf(local_view[i]) === -1) {
             view_module.deleteView(local_view[i]);
         }
      }

     res.status(200);
});



//responds to endpoint /view returns view
router.get('/', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({view: view_module.getMain_view()});
});


//PUT checks if valid key
router.put('/', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	const ip_port = req.body.ip_port;
    const retVal = {};
    var code;
    //checks if ip_port is already in view else adds
    if(view_module.insertView(ip_port)){
        shard_module.addShardMember(ip_port);
        retVal.result = 'Success';
        retVal.msg = 'Successfully added ' + ip_port + ' to view';
        code = 200;
    }else{
        retVal.result = 'Error';
        retVal.msg = ip_port + ' is already in the view';
        code = 404;
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
    if(view_module.deleteView(ip_port)){
        shard_module.removeShardMember(ip_port);
        retVal.result = 'Success';
        retVal.msg = 'Successfully removed ' + ip_port + ' from view';
        code = 200;
    }else{
        retVal.result = 'Error';
        retVal.msg = ip_port + ' is not in current view';
        code = 404;
    }

    res.status(code).json(retVal);
});


module.exports = router;
