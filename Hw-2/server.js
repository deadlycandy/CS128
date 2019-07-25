//configuring environment variables
require('dotenv').config();

//imports in node.js 
const http = require("http");
var app = require("./app");

const port = 8080;

if(process.env.MAINIP != '10.0.0.20:8080'){
   app = require("./keyValue-app");
}


const server = http.createServer(app);

server.listen(port);
