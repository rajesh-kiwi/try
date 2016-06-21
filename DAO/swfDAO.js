var dbConfig = require('./db-config');
var config = require('../config');

var insertUserDetails = function(userDetails, callback){
    try {
        dbConfig.getConnection(function (db) {
            if (db) {
                db.collection(config.mongoDB.collections.user).insert(userDetails, function (err, result) {
                    if (err) {
                        callback(null);
                    } else {
                        callback(result);
                    }
                    db.close();
                });
            } else {
                console.log(config.lostMongoConnection);
                callback(null);
            }
        });
    } catch (e) {
        console.log(e);
        callback(null);
    }
}

var updateUserDetails = function(sessionId, data, callback) {
    try{
        dbConfig.getConnection(function(db){
            if(db){
                db.collection(config.mongoDB.collections.user).updateOne({sessionId: sessionId}, { $set: data}, function(err, result){
                    if(err){
                        callback(null);
                    }else{
                        callback(result);
                    }
                    db.close();
                });
            }else{
                console.log(config.lostMongoConnection);
                callback(null);
            }
        });
    }catch(e){
        console.log(e);
        callback(null);
    }
}

var findUser = function (details, callback) {
    try {
        dbConfig.getConnection(function (db) {
            if (db) {
                var findQuery = {sessionExpired: {$exists:false}};
                if (details) {
                    for (var key in details) {
                        findQuery[key] = details[key];
                    }
                }
                
                db.collection(config.mongoDB.collections.user).find(findQuery).toArray(function (err, result) {
                    if (err) {
                        callback(null);
                    } else {
                        callback(result);
                    }
                    db.close();
                });

            } else {
                console.log(config.lostMongoConnection);
                callback(null);
            }
        });
    } catch (e) {
        console.log(e);
        callback(null);
    }
}

var removeExpireSessions = function(callback){
    try{
        dbConfig.getConnection(function(db){
            if(db){
                var date = Date.now();
                db.collection(config.mongoDB.collections.user).find({sessionExpired: {$exists:false}, expireAt: {$lt:date}}).toArray(function(err, result){
                    if(err){
                        return callback(null);
                    }
                    db.collection(config.mongoDB.collections.user).update({expireAt:{$lt: date}}, {$set: {sessionExpired: true}}, function(err, removeResult){
                        if(err){
                            callback(null);
                        }else{
                            callback(result);
                        }
                        db.close();
                    });
                });
            }else{
                console.log(config.lostMongoConnection);
                callback(null);
            }
        });
    }catch(e){
        console.log(e);
        callback(null);
    }
}

module.exports = {
    insertUserDetails: insertUserDetails,
    updateUserDetails: updateUserDetails,
    findUser: findUser,
    removeExpireSessions: removeExpireSessions
}