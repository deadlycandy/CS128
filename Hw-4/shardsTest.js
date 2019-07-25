require('dotenv').config();
console.log(process.env.VIEW);
//Tests shards-backend.js
const shards = require('./api/data/shards-backend.js');
const kvs = require('./api/data/keyValue-store-backend.js');

var shardNum = 3;
var id = 0;
//var ip_port = "192.168.0.4:8080";
var ip_port = "C";

console.log("\n");

shards.makeShard(shardNum);

console.log("Sent request for makeShard" + "(" + shardNum + ")");

console.log("\n");

//console.log("GetShards()  " + Object.keys(JSON.stringify(shards.getShards()));

console.log("GetShards() Keys " + Object.keys(shards.getShards()));

console.log("\n");

console.log("GetMembersCount(0) " + shards.getMembersCount(0));

console.log("\n");

console.log("GetShardsID(" + ip_port + ")  " + shards.getShardsID(ip_port));

console.log("\n");

console.log("GetALLID().length  " + shards.getAllIDS().length);

/*
*
* BEGINNING TEST FOR KVS SPLITTING
*
*/
kvs.insertValue("raymond", "version1", {});
kvs.insertValue("rahil", "version2", {});
for(var i = 0; i < 10000; i++);
kvs.insertValue("raymond", "version2", kvs.getWorldClock());
kvs.insertValue("james", "version2", kvs.getWorldClock());

console.log(kvs.shardKVS());

console.log("\n");

kvs.insertValue("a", "version1", {});
kvs.insertValue("b", "version2", {});
kvs.insertValue("a", "version2", kvs.getWorldClock());

/*
*
* BEGINNING TESTS FOR KVS MERGING
*
*/
anotherKVS = {
    "james": ["version1", "version2"],
    "mitchell": ["version5", "version7"] 
}

kvs.merge(anotherKVS);
kvs.print();
