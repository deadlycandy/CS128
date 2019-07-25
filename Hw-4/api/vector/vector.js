var vector = {};

//will iterate through an object of size n, then create an n sized vector with values set to 0. The keys of the vector will mirror the key of the obj
vector.makeVector = function(kvs) {

    var retVal = {};
    for(var key in kvs) {
        retVal[key] = 0;
    }

    return retVal;
}

/*
* Increments the key of the vector by 1. will return true on success
*/
vector.incrementKey = function(vector, key) {
    if(key in vector) {
        vector[key]++;
    }
    else vector[key] = 1;
}

/*
* Increments the key of the vector by n. will return true on success
*/
vector.incrementKeyN = function(vector, key, n) {
    if(key in vector) {
        vector[key] += n;
    }
    else vector[key] = n;
}

/*
* 0 if vectors uncomparable or equivalent
* 1 if vector2 is strictly greater
* -1 if vector1 is strictly greater
*/
vector.isLessThan = function(vector1, vector2) {

    var greater1 = true;
    var greater2 = true;

    for(key in vector1) {
        if(key in vector2) {
            if(vector1[key] < vector2[key]) {
                greater1 = false;
            }
            else if(vector2[key] < vector1[key]) {
                greater2 = false;
            }
        }
        else if(vector1[key] > 0) {
            greater2 = false;
        }
    }

    if(greater1) {
        for(key in vector2) {
            if(!(key in vector1) && vector2[key] > 0) {
                greater1 = false;
            }
        }
    }

    if(greater1 && greater2) {
        return 0;
    }
    else if(greater1) {
        return -1;
    }
    else if(greater2) {
        return 1;
    }
    else {
        return 0;
    }

}

//is Exactly equal serves the purpose of checking whether or not the vectors are exactly the same.
//It does NOT do the implicit 0 assumption
vector.isExactlyEqual = function(vector1, vector2) {

    for(key in vector1) {
        if(key in vector2) {
            if(vector2[key] != vector1[key]) {
                return false;
            }
        }
        else {
            return false;
        }
    }

    for(key in vector2) {
        if(!(key in vector1)) {
            return false;
        }
    }

    return true;
}

/*
* Will take the max of two vectors, introducing any missing dimensions
*/
vector.takeMax = function(vector1, vector2) {
    var retVal = {};
    for(key in vector1) {
        if(key in vector2) {
           retVal[key] = max(vector1[key], vector2[key]);
        }
        else {
            retVal[key] = vector1[key];
        }
    }

    for(key in vector2) {
        if(!(key in vector1)) {
            retVal[key] = vector2[key];
        }
    }

    return retVal;
}

// updating vector 1 with max val at key
vector.takeMaxKey = function(vector1, vector2, key){
    var vecVal = 0;
    var vecVal2 = 0;

    if(key in vector1) vecVal = vector1[key];
    if(key in vector2) vecVal2 = vector2[key];

    var maxVal = max(vecVal, vecVal2);
    var diff = maxVal - vecVal;

    vector.incrementKeyN(vector1, key, diff);
}

// will return true if vector1 hasNewerVersion of key
vector.hasNewerVersion = function(vector1, vector2, key) {
    var version1 = 0;
    var version2 = 0;
    if(key in vector1) version1 = vector1[key];
    if(key in vector2) version2 = vector2[key];

    if(version2 <= version1) {
         return true;
    }

    return false;
}

/*
* will print out a vector
*/
vector.print = function(vector) {
    var print = "";
    for(key in vector) {
        print += key + ":" + vector[key] + " ";
    }
    console.log(print.trim());
}

/*
* returns a copy of a vector
*/
vector.copy = function(vector) {
    var retVal = {};
    for(key in vector) {
        retVal[key] = vector[key];
    }
    return retVal;
}

/*
* helper method for taking max of two numbers
*/
function max(int1, int2) {
    return int1 > int2 ? int1 : int2;
}

module.exports = vector;
