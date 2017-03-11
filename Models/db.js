var mongoose = require('mongoose');
var config = require('../config');

var dbURI = config.mongoDbURI;

var conn = mongoose.createConnection(dbURI, {server: {auto_reconnect: false}});

conn.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbURI);
});
// If the connection throws an error
conn.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

conn.on('reconnected', function () {
    console.log('Mongoose reconnected!');
});
conn.on('disconnected', function () {
    console.log('Mongoose disconnected!');
    setTimeout(function () {
        mongoose.connect(dbURI, {server: {auto_reconnect: false}});
    }, 3000);
});


//mongoose.connect(dbURI, {server: {auto_reconnect: false}});
// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
    conn.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});
module.exports = exports = conn;