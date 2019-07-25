const vector = require('../vector/vector');
const version = require('../vector/version');
const shards_module = require('./shards-backend');
const view_module = require('./view-backend');

var kvs = {};

var store = {};

//world clock tracks what we have seen
var worldClock = vector.makeVector(store);

kvs.getWorldClock = function(){
    return worldClock;
}

kvs.getStore = function(){
    return JSON.parse(JSON.stringify(store));
}

kvs.getRandomKey = function(){
    var keys = Object.keys(store);
    return keys[Math.floor(Math.random() * keys.length)];
}

kvs.keyExists = function(key, payload){
    return (key in store && payload.timestamp in store[key] && vector.isExactlyEqual(worldClock,payload.versionVector));
}

kvs.searchNewestLocal =  function (key, versionVector) {

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

kvs.insertValue = function(key, value, versionVector) {
    vector.takeMaxKey(worldClock, versionVector, key);

    var newData = version.makeNextVersion(key, value, worldClock);

    vector.incrementKey(worldClock, key);

    if(!(key in store)) store[key] = {};
    store[key][newData.timestamp] = newData;
}

kvs.insertBootstrap =  function(key, payload){
    vector.takeMaxKey(worldClock, payload.versionVector, key);
    if(!(key in store)) store[key] = {};
    store[key][payload.timestamp] = payload;
}

kvs.updatePayload =  function(key, payload){
    vector.takeMaxKey(payload, worldClock, key)
}

kvs.hashKey = function(key){
    //hash a key and find out what shard we must send it to.
     return key.charCodeAt(0) % shards_module.getAllIDS().length;
}

//takes the current values in the kvs, and splits n kvs's corresponding to the shard it must go into
kvs.shardKVS = function(){
    //Redistribute data across new shards
    var n = shards_module.getAllIDS().length;
    var kvsList = [];

    for(var i = 0; i < n; i++) {
        kvsList[i] = {};
    }

    for(key in store) {
        var hashID = kvs.hashKey(key);
        kvsList[hashID][key] = JSON.parse(JSON.stringify(store[key]));
    }

    return kvsList;

}

//takes the current shard ID, then DESTRUCTIVELY removes all keys that don't fit within the current
//shard
kvs.purge = function() {

    var shardID = shards_module.getShardsID(process.env.IP_PORT);

    for(key in store) {
        var hash = kvs.hashKey(key);
        if(hash != shardID) {
            delete store[key];
        }
    }
}

//will merge two kvs's. Does not do a check on whether or not the keys are legally allowed to be in there.
//THIS DOES NOT IN ANY WAY HANDLE HOW THE CLOCKS ARE UPDATED
kvs.merge = function(toMerge) {

    for(key in toMerge) {
        if(key in store) {
            for(versions in toMerge[key]) {
                store[key][versions] = toMerge[key][versions]
            }
        }
        else {
            store[key] = toMerge[key];
        }
    }
}

//will merge a different clock with the local worldClock
kvs.mergeWorldClock = function(otherClock) {

    for(key in otherClock) {
        if(key in worldClock) {
            worldClock[key] = vector.takeMaxKey(worldClock, otherClock, key);
        }
        else {
            worldClock[key] = otherClock[key];
        }
    }
}


kvs.print = function() {
    console.log(store);
}


module.exports = kvs;
