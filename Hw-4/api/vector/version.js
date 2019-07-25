var version = {};
const vector = require('./vector');

/*
* Version obj:
*   instance variables:
*       value - thing that it holds
*       timestamp - timestamp @creation 
*       versionVector - the version vector
*/

/*
* Will make a new version of the key, with the specified value, an updated version number, and the current timestamp of the system you're using
*/
version.makeNextVersion = function(key, value, versionVector) {

    retVal = {
        'value': value,
        'versionVector': vector.copy(versionVector),
        'timestamp': + new Date() 
    }; 
    
    vector.incrementKey(retVal.versionVector, key);
    return retVal;
}

/*
* 0 if versions are uncomparable or equivalent
* 1 if version 2 is strictly greater
* -1 if version 1 is strictly greater 
*/
version.isLessThan = function(version1, version2) {
    var compareVec = vector.isLessThan(version1.versionVector, version2.versionVector);
    
    if(compareVec != 0) return compareVec;
    
    var compareTime = version1.timestamp - version2.timestamp; 
    
    if(version1.timestamp > version2.timestamp) {
        return -1;
    }
    else if(version2.timestamp > version1.timestamp) {
        return 1;
    }
    else {
        return 0;
    } 
}

module.exports = version;
