//configuring environment variables
require('dotenv').config();

//imports in node.js
const http = require("http");
var app = require("./keyValue-app");

const port = 8080;

const server = http.createServer(app);

// console.log(process.env.IP_PORT);
//
// console.log(process.env.S); //Number of shards

server.listen(port);
