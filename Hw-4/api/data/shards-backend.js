const view_module = require('./view-backend');

var shards = {};
var ip_shards = {};



//Creates/reshards  if shardNum is valid returns bool
shards.makeShard = function(shardNum){

    var ip_ports = view_module.getMain_view();
    var shard_id = 0;
    if(ip_ports.length - shardNum*2 < 0) return false;

    ip_shards = {};

    for(let i = 0; i < ip_ports.length; i++){
        ip_shards[shard_id] = (typeof ip_shards[shard_id] != 'undefined') ? ip_shards[shard_id] : [];
        ip_shards[shard_id].push(ip_ports[i]);
        shard_id = shard_id == shardNum-1 ? 0 : shard_id + 1;

    }

    //shuffle data accross new shards

    return true;

}

//shards.makeShard(process.env.S);
//Adding a new node to Shards
shards.addShardMember = function(ip_port){
    var id = shards.getShardsID(ip_port);
    var index = ip_shards[id].indexOf(ip_port);
    if(index == -1){
        ip_shards[id].push(ip_port);
    }
}

//Removing a node from a shard
shards.removeShardMember = function(ip_port){
    var id = shards.getShardsID(ip_port);
    var index = ip_shards[id].indexOf(ip_port);
    if (index > -1) {
        ip_shards[id].splice(index, 1);
    }
}

//Checking if there exists a invalid shard
shards.invalidShards = function(){
    for(var shardID in ip_shards){
        if(ip_shards[shardID].length < 2){
            return true;
        }
    }
    return false;
}

//Returns a copy of ip_shards
shards.getShards =  function(){
    return JSON.parse(JSON.stringify(ip_shards));
}

//Returns the shard ID a node belongs to
shards.getShardsID = function(ip_port){
    //update according to view
    var view = view_module.getMain_view();
    var index = view.indexOf(ip_port);


    //checking if the ip_port exists
    if(index > -1){
        return index % Object.keys(ip_shards).length;
    }
    return -1;
}

//Returns an array of members for shard ID
shards.getMembers = function(id){
    return ip_shards[id];
}


//Return a list of all IDS
shards.getAllIDS = function(){
    return Object.keys(shards.getShards());
}

shards.getMembersCount = function(id){
    return ip_shards[id].length;
}


shards.getRandomMember = function(id){
    var members = ip_shards[id];

    if(members.length == 1) return id;

    ip_port = members[Math.floor(Math.random * members.length)];
    while(id == ip_port) ip_port = members[Math.floor(Math.random() * members.length)];
    return ip_port;
}

//Returns a valid number of shards.
shards.getValidNumShards = function(){
    var ip_ports = view_module.getMain_view();
    var shardNum = shards.getAllIDS().length;
    while(ip_ports.length - shardNum*2 < 0){
        shardNum--;
    }
    return shardNum;


}

//loops through the ips and checks if they are equivalent with the current shard's
//if it isn't, then the function will delete the key from the arrayOfIPs
shards.removeInvalidIPs = function(arrayOfIPs) {

    var shardID = shards.getShardsID(process.env.IP_PORT);
    for(keys in arrayOfIPs) {
        if(shards.getShardsID(arrayOfIPs[keys]) != shardID) {
            delete arrayOfIPs.keys;
        }
    }
}

module.exports = shards;
