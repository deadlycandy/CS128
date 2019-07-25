/* Contains HTTP functions for /shard endpoint */

const express = require('express');
const router = express.Router({ caseSensitive: true });
const request = require('request');
const shards_module = require('../data/shards-backend');

/*
GET /shard/my_id
Should return the container’s shard id
{“id”:<container’sShardId>},
Status = 200
*/
//Which container? This function returns the latest one
router.get('/my_id', (req, res) => {
	const retVal = {};
	retVal.id = shards_module.getShardsID(process.env.IP_PORT);
	res.status(200).json(retVal);
});

/*
GET /shard/all_ids
Should return a list of all shard ids in the system as a string of comma separated values.
{“result”: “Success”,
“shard_ids”: “0,1,2”},
Status = 200
*/

router.get('/all_ids', (req, res) => {
	const retVal = {};
	retVal.shard_ids = shards_module.getAllIDS().toString().replace("\\[|\\]|\\s", "");

	retVal.result = "Success";
	res.status(200).json(retVal);

});

/*
GET /shard/members/<shard_id>
Should return a list of all members in the shard with id <shard_id>. Each member should be represented as an ip-port address.
(Again, the same one you pass into VIEW)
{“result” : “Success”,
“members”: “176.32.164.2:8080,176.32.164.3:8080”},
Status = 200
If the <shard_id> is invalid, please return:
{“result”: “Error”,
“msg”: “No shard with id <shard_id>”},
Status = 404
*/
router.get('/members/:id', (req, res) => {
	const id = req.params.id;
	const retVal = {};
	var code;

	var members = shards_module.getMembers(id);

	if(members == undefined){
		retVal.result = "Error";
		retVal.msg = "No shard with id" + givenKey;
		code = 404;
	}else{

		retVal.members = members.toString().replace("\\[|\\]|\\s", "");
		code = 200;
		retVal.result = "Success";
	}

	res.status(code).json(retVal);

});

/*
GET /shard/count/<shard_id>

Should return the number of key-value pairs that shard is responsible for as an integer
{“result”: “Success”,
“Count”: <numberOfKeys> },
Status = 200
If the <shard_id> is invalid, please return:
{“result”: “Error”,
“msg”: “No shard with id <shard_id>”},
Status = 404
*/
router.get('/count/:id', (req, res) => {
	const id = req.params.id;
	const retVal = {};
	var code;

	var members = shards_module.getMembers(id);
	//Define with KVS backend

	 if(members == undefined){
	 	retVal.result = "Error";
	 	retVal.result = "No shard with id" + id;
	 	code = 404;
	 }else{
	 	retVal.count = members.length;
	 	code = 200;
	 }

	res.status(code).json(retVal);

});

/*PUT /shard/changeShardNumber -d=”num=<number>”
Should initiate a change in the replica groups such that the key-values are redivided across <number> groups and returns a list of all shard ids, as in GET /shard/all_ids
{“result”: “Success”,
“shard_ids”: “0,1,2”},
Status = 200
If <number> is greater than the number of nodes in the view, please return:
{“result”: “Error”,
“msg”: “Not enough nodes for <number> shards”},
Status = 400
If there is only 1 node in any partition as a result of redividing into <number> shards, abort the operation and return:
{“result”: Error”,
“msg”: “Not enough nodes. <number> shards result in a nonfault tolerant shard”},
Status = 400
The only time one should have 1 node in a shard is if there is only one node in the entire system. In this case it should only return an error message if you try to increase the number of shards beyond 1, you should not return the second error message in this case.
*/

router.put('/changeShardNumber/', (req, res) => {
	const num = req.body.num;
	const retVal = {};
	var code;

	//checking if input is the same number of shards
	var newShard = shards_module.getAllIDS().length == num ? true : shards_module.makeShard(num);

	if(newShard){
		retVal.result = "Success";
		code = 200;
		retVal.shard_ids = shards_module.getAllIDS();
	}else{
		retVal.result = "Error";
		code = 400;
		retVal.msg = "Not enough nodes. " + num + " shards result in a nonfault tolerant shard";
	}

	res.status(code).json(retVal);

});

module.exports = router;
