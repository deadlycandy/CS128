const vector = require('./api/vector/vector.js');
const version = require('./api/vector/version.js');


var kvs = {
    'a': "hello",
    'b': "goodbye",
    'c': "goodnight"
}

var versiona1 = version.makeNextVersion('a', kvs.a, vector.makeVector(kvs));
//this is to make the date differ
var versiona2 = version.makeNextVersion('a', kvs.a + "goodbye", versiona1.versionVector);

vector.incrementKeyN(versiona2.versionVector, 'a', -1);
vector.incrementKeyN(versiona2.versionVector, 'f', 0);

//vector.incrementKey(versiona1.versionVector, 'b');
//vector.incrementKey(versiona2.versionVector, 'c');

console.log(vector.isExactlyEqual(versiona1.versionVector, versiona2.versionVector));
