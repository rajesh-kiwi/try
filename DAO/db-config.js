var MongoClient = require('mongodb').MongoClient;

var config = require('../config');

var getConnection = exports.getConnection = function (cb) {
    MongoClient.connect(config.mongoDB.url, function (err, db) {
        if(err){
            cb(null);
        }else{
            cb(db);
        }
    });
}