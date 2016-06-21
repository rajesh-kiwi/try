var config = require('../config');
var swfService = require('../service/swfService');

var getHomePage = function (req, res) {
    res.send('***** Shop With Friends (SWF) *****');
}

var createSession = function (req, res) {
    try {
        swfService.createSession(req.body, function (result) {
            res.send(result);
        });
    } catch (e) {
        console.log(e);
        res.send(config.exceptionObj);
    }
}

var getSessionDetails = function (req, res) {
    try {
        swfService.findSessionDetails(req.params.sessionId, function (result) {
            res.send(result);
        });
    } catch (e) {
        console.log(e);
        res.send(config.exceptionObj);
    }
}

var saveAndNotifyFriends = function (req, res) {
    try {
        var data = {
            sessionId: req.params.sessionId
            , friendsDetails: req.body
        }
        swfService.saveAndNotifyFriendsDetails(data, function (result) {
            res.send(result);
        })
    } catch (e) {
        console.log(e);
        res.send(config.exceptionObj);
    }
}

var saveAndNotifyFriendsResponses = function (req, res) {
    try {
        var frdResponseDetails = {
            sessionId: req.params.sessionId
            , type: req.params.type
            , frdMessage: req.query.reply
        }
        
        if(req.params.type == 'mms'){
            delete frdResponseDetails.sessionId;
            frdResponseDetails.frdMessage = req.query.Body;
            frdResponseDetails.mms = req.query.From
        }else{
            frdResponseDetails[frdResponseDetails.type] = new Buffer(req.params.contact, 'base64').toString('ascii');
        }
        
        swfService.saveAndNotifyFriendsResponses(frdResponseDetails);
        res.send(config.responseThankuMessage);

    } catch (e) {
        console.log(e);
        res.send(config.exceptionObj);
    }
}

var solebrityUpdateCallback = function (req, res) {
    console.log(req.body);
    console.log('solebrity got details at update hook');
    res.send('solebrity got details at update hook');
}

var solebrityCompleteCallback = function (req, res) {
    console.log(req.body);
    console.log('solebrity got details at complete hook');
    res.send('solebrity got details at complete hook');
}

module.exports = {
    getHomePage: getHomePage
    , createSession: createSession
    , getSessionDetails: getSessionDetails
    , saveAndNotifyFriends: saveAndNotifyFriends
    , saveAndNotifyFriendsResponses: saveAndNotifyFriendsResponses
    , solebrityUpdateCallback: solebrityUpdateCallback
    , solebrityCompleteCallback: solebrityCompleteCallback
}