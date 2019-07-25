//Tests Key-value Store-backend
const kvs = require('./api/data/keyValue-store-backend.js');
const kvs1 = require('./api/data/keyValue-store-backend.js');
const shards = require('./api/data/shards-backend.js');

var key = 'a';
var value = 'test'
var versionVector = {'a': 1};
var versionVector1 = {b: 3};
var shardNum = 3;

var versionVector4 = {'a':3, 'b': 10, 'c':6};

console.log("\n");
 
//InsertValue
kvs.insertValue('a', value, versionVector);
kvs.insertValue('b', value, versionVector1)
versionVector['a'] += 1;

shards.makeShard(shardNum);

console.log("\n");

console.log("getWorldClock():  " + Object.keys(kvs.getWorldClock()));

console.log("\n");

console.log("getRandomKey():  " + kvs.getRandomKey());

console.log("\n");

console.log("keyExists(a, versionVector):  " + kvs.keyExists('a', versionVector))
console.log("keyExists(b, kvs.getWorldClock()):  " + kvs.keyExists('b', kvs.getWorldClock()));
console.log("keyExists(b, versionVector):  " + kvs.keyExists('b', versionVector));


console.log("\n");


console.log("searchNewestLocal(key, versionKey):  " + kvs.searchNewestLocal(key, versionVector));

console.log("\n");


console.log("hashKey('a')  " + kvs.hashKey('a'));
console.log("hashKey('b')  " + kvs.hashKey('b'));
console.log("hashKey('c')  " + kvs.hashKey('c'));
console.log("hashKey('d')  " + kvs.hashKey('d'));

console.log("\n");

console.log("SharedKVS");
console.log(kvs.shardKVS());

console.log("\n");

console.log("Inserted Values");
kvs.insertValue("raymond", "version1", {});
kvs.insertValue("rahil", "version2", {});
for(var i = 0; i < 10000; i++);
kvs.insertValue("raymond", "version2", kvs.getWorldClock());
kvs.insertValue("james", "version2", kvs.getWorldClock());

console.log("SharedKVS");
console.log(kvs.shardKVS());

console.log("\n");

kvs.insertValue("a", "version1", {});
kvs.insertValue("b", "version2", {});
//kvs.insertValue("a", "version2", kvs.getWorldClock());

/*console.log("Purged Keys From Shard");
kvs.purgeKeysFromShard();
console.log("\n");*/

console.log("print");
kvs.print();
console.log("\n");

kvs1.insertValue('kvs1a', value, versionVector);
kvs1.insertValue('kvs1b', value, versionVector1)

//console.log("merge");
kvs.merge(kvs1.getStore());

console.log("print");
kvs.print();
console.log("\n");

console.log("insertBootstrap");

var payload = {'a':5, 'b':7, 'c':8}
kvs.insertBootstrap('c', payload);

console.log("\n");

console.log("print");
kvs.print();
console.log("\n");

console.log(kvs.getWorldClock());
var otherClock = 
{ 'a': 39,
  'b': 50,
  'raymond': 20,
  'rahil': 10,
  'james': 10,
  'kvs1a': 10,
  'kvs1b': 10,
  'c': 80 };

console.log("Merged World Clocks");
kvs.mergeWorldClock(otherClock);

console.log(kvs.getWorldClock());


