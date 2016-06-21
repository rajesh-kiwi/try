var swfDAO = require('../DAO/swfDAO');
var config = require('../config');
var util = require('../util/util');

var findUser = function (data, callback) {
    swfDAO.findUser(data, function (userResult) {
        callback(userResult)
    });
}

var createSession = function (data, callback) {
    try {
        var validateParams = util.validateSessionParams(data);
        if (!validateParams) {
            return callback({
                status: config.errorMessage
                , message: config.invalidValueMessage + ' OR ' + config.missingParametersErrorMessage
            });
        }
        findUser({userId: data.userId}, function (userResult) {
            if (userResult) {
                if (userResult.length) {
                    return callback({
                        status: config.errorMessage
                        , message: config.detailsExistsMessage
                    });
                }

                var sessionId = util.createUUID();
                data['sessionId'] = sessionId;
                data['createdTime'] = Date.now();
                data['expireAt'] = Date.now() + data.sessionDuration * 1000 * 60;

                swfDAO.insertUserDetails(data, function (insertUserResult) {
                    if (insertUserResult) {
                        callback({
                            status: config.successMessage
                            , message: config.sessionCreatedSuccessMessage
                            , sessionId: sessionId
                        });
                    } else {
                        callback(config.exceptionObj);
                    }
                });
            } else {
                callback(config.exceptionObj);
            }
        });
    } catch (e) {
        console.log(e);
        callback(config.exceptionObj);
    }
}

var findSessionDetails = function (sessionId, callback) {
    try {
        if(!sessionId) {
            return callback({
                status: config.errorMessage,
                message: config.invalidValueMessage + ' OR ' + config.missingParametersErrorMessage
            });
        }
        findUser({sessionId: sessionId}, function (sessionDetails) {
            if (sessionDetails) {
                if (!sessionDetails.length) {
                    return callback({
                        status: config.errorMessage
                        , message: config.sessionNotFoundMessage
                    });
                }
                callback(sessionDetails);
            } else {
                callback(config.exceptionObj);
            }
        });
    } catch (e) {
        console.log(e);
        callback(config.exceptionObj);
    }
}

var saveAndNotifyFriendsDetails = function (reqData, callback) {
    try {
        (function (data) {
            
            var validate = util.validateNotifyFriendParams(data.friendsDetails);
            
            if (!validate) {
                return callback({
                    status: config.errorMessage
                    , message: config.invalidValueMessage + ' OR ' + config.missingParametersErrorMessage
                });
            }
            
            findUser({sessionId: data.sessionId}, function (sessionDetailsArr) {
                if (sessionDetailsArr) {
                    if (!sessionDetailsArr.length) {
                        return callback({
                            status: config.errorMessage
                            , message: config.sessionNotFoundMessage
                        });
                    }else{
                        var sessionDetails = sessionDetailsArr[0];
                        if (!sessionDetails.friendsDetails) {
                            
                            swfDAO.updateUserDetails(sessionDetails.sessionId, {friendsDetails: data.friendsDetails}, function(updateResult){
                                if(updateResult){
                                    util.notifyFriends(data.friendsDetails.users, sessionDetails.sessionId, sessionDetails.userId,  function(notifyFrdsResult){
                                        callback(notifyFrdsResult);
                                    });
                                }else{
                                    console.log(updateResult);
                                    callback(config.exceptionObj);
                                }
                            });
                            
                        } else {
                            //var insertData = false;
                            for (var method in data.friendsDetails.users) {
                                if (!sessionDetails.friendsDetails.users[method]) {
                                    //insertData = true;
                                    sessionDetails.friendsDetails.users[method] = data.friendsDetails.users[method];
                                } else {
                                    data.friendsDetails.users[method].forEach(function (newDetails) {
                                        var pushDetails = true;
                                        sessionDetails.friendsDetails.users[method].forEach(function (oldDetails) {
                                            
                                            if (oldDetails[config.notificationMethodMap[method]] == newDetails[config.notificationMethodMap[method]]){
                                                pushDetails = false;
                                                //insertData = true;
                                                for(var nKey in newDetails){
                                                    oldDetails[nKey] = newDetails[nKey];
                                                }
                                            }
                                        });
                                        
                                        if(pushDetails){
                                            sessionDetails.friendsDetails.users[method].push(newDetails);
                                            //insertData = true;
                                        }
                                        
                                    });
                                }
                            }
                            
                            //if(insertData){
                                swfDAO.updateUserDetails(sessionDetails.sessionId, sessionDetails, function(updateResult){
                                    if(updateResult){
                                        util.notifyFriends(data.friendsDetails.users, sessionDetails.sessionId, sessionDetails.userId,  function(notifyFrdsResult){
                                            callback(notifyFrdsResult);
                                        });
                                    }else{
                                        console.log(updateResult);
                                        callback(config.exceptionObj);
                                    }
                                });
//                            }else{
//                                callback({
//                                    status: config.errorMessage,
//                                    message: config.detailsExistsMessage
//                                });
//                            }
                        }
                    }
                } else {
                    callback(config.exceptionObj);
                }
            });
        })(reqData);
    } catch (e) {
        console.log(e);
        callback(config.exceptionObj);
    }
}

var saveAndNotifyFriendsResponses = function (data) {
    try {
        var findQuery = {sessionId: data.sessionId};

        if (data.type == 'mms') {
            var messageArr = data.frdMessage.trim().split(' ');
            data.frdMessage = data.frdMessage.substring(data.frdMessage.indexOf(" ") + 1).trim();
            findQuery = {
                userId: messageArr[0].trim()
            };
        }

        findUser(findQuery, function (sessionDetailsArr) {
            if (sessionDetailsArr) {
                if (!sessionDetailsArr.length) {
//                        return callback({
//                            status: config.errorMessage
//                            , message: config.sessionNotFoundMessage
//                        });
                } else {
                    var sessionDetails = sessionDetailsArr[0];
                    sessionDetails.friendsDetails.users[data.type].forEach(function(details){
                        if(details[config.notificationMethodMap[data.type]] == data[data.type]){
                            details.response = data.frdMessage;
                        }
                    });

                    swfDAO.updateUserDetails(sessionDetails.sessionId, sessionDetails, function(updateResult){
                        if(updateResult){
                            util.notifySolebrity(sessionDetails, null, function(notifyFrdsResult){
                                //callback(notifyFrdsResult);
                            });
                        }else{
                            console.log(updateResult);
                            //callback(config.exceptionObj);
                        }
                    });

                }
            } else {
                //callback(config.exceptionObj);
                console.log(config.sessionNotFoundMessage + ' (got response from frd) with session Id/userId ' + data.sessionId);
            }
        });
        
    } catch (e) {
        console.log(e);
        callback(config.exceptionObj);
    }
}

module.exports = {
    createSession: createSession
    , findSessionDetails: findSessionDetails
    , saveAndNotifyFriendsDetails: saveAndNotifyFriendsDetails
    , saveAndNotifyFriendsResponses: saveAndNotifyFriendsResponses
}