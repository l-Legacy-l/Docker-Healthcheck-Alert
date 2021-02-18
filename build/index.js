"use strict";
var http = require('http');
var options = {
    socketPath: '/var/run/docker.sock',
    path: '/containers/json'
};
var callback = function (resp) {
    console.log("STATUS: " + resp.statusCode);
    console.log(resp);
    var body = '';
    resp.on('data', function (chunk) {
        body += chunk;
    }).on('end', function () {
        var respArr = JSON.parse(body + '');
    }).on('error', function (data) { return console.error(data); });
};
var clientRequest = http.get(options, callback);
clientRequest.end(0);
