var uuid = require('uuid');
var gcm = require('node-gcm');
var twilio = require('twilio');
var email = require("emailjs");
var mailer = require("nodemailer");
var request = require('request');

var config = require('../config');
var swfDAO = require('../DAO/swfDAO');

var validateSessionParams = function (data) {
    try {
        if (Object.keys(data).length != Object.keys(config.createSessionParams).length) {
            return false;
        }

        for (var key in config.createSessionParams) {
            if (!data[key]) {
                return false;
            }
        }
        
        if(isNaN(data.sessionDuration)){   // special check for session duration
            return false;
        }

        return true;
    } catch (e) {
        console.log(e);
        return false;
    }

}

var validateNotifyFriendParams = function (data) {

    try {
        if (!data.users) {
            return false;
        }

        for (var method in data.users) {
            if (!config.notifyFriendsMethods[method]) {
                return false;
            } else {
                for (var i = 0; i < data.users[method].length; i++) {
                    var obj = data.users[method][i];
                    for (var key in obj) {
                        if (!config.notifyFriendsMethods[method][key]) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

var createUUID = function () {
    return uuid.v1({
        node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab]
        , clockseq: 0x1234
        , msecs: new Date().getTime()
        , nsecs: 5678
    });
}

var notificationMethods = {
    email: function(details, sessionId, userId, callback){
        sendEmailV2(details, sessionId, callback);
    },
    mms: function(details, sessionId, userId, callback){
        sendMMS(details, sessionId, userId, callback);
    },
    pushNotification: function(details, sessionId, userId, callback){
        sendPushNotification(details, sessionId, callback);
    }
}

var notifyFriends = function (reqData, reqSessionId, reqUserId, callback) {
    try {
        (function (data, sessionId, userId) {

            var totalNumOfNotifications = 0
                , totalDataLength = 0
                , callBackDetails = [];


            for (var method in data) {
                
                totalDataLength += data[method].length;
                
                data[method].map(function (details) {
                    notificationMethods[method](details, sessionId, userId, function (mailResult) {
                        totalNumOfNotifications++;
                        callBackDetails.push(mailResult);
                        if (totalNumOfNotifications == totalDataLength) {
                            callback(callBackDetails);
                        }
                    });
                });
                
            }
            
        })(reqData, reqSessionId, reqUserId);

    } catch (e) {
        console.log(e);
        callback({});
    }
}

var sendEmail = function (mailInfo, sessionId, callback) {
    try {
        var smtpTransport = mailer.createTransport("SMTP", {
            service: "Gmail"
            , auth: {
                user: config.smtpMailInfo.mailId
                , pass: config.smtpMailInfo.password
            }
        });

        var url = config.serverUrl + '/reply/' + '' + sessionId + "/" + new Buffer(mailInfo.emailId).toString('base64') + '/email' + '/?reply';

        var mail = {
            from: config.smtpMailInfo.name + " <" + config.smtpMailInfo.mailId + ">"
            , to: mailInfo.emailId
            , subject: "Shop With Friends (SWF) sent you mail"
            , attachments: [{
                filename: 'raj.jpg',
                path: process.cwd() + '/attachments/raj.jpg',
                contentType: 'image/*'
              }]
            , text: ""
            , html: mailInfo.message + " <a style='text-decoration: initial;' href=" + mailInfo.imageUrl + " >" + mailInfo.imageUrl + "</a> <a style='text-decoration: none;font: menu;display: inline-block;padding: 2px 8px;background: ButtonFace;color: ButtonText;border-style: solid;border-width: 2px;border-color: ButtonHighlight ButtonShadow ButtonShadow ButtonHighlight;' href=" + url + "=yes" + "> Yes i lyk it </a> <a style='text-decoration: none;font: menu;display: inline-block;padding: 2px 8px;background: ButtonFace;color: ButtonText;border-style: solid;border-width: 2px;border-color: ButtonHighlight ButtonShadow ButtonShadow ButtonHighlight;' href=" + url + "=maybe" + "> May be </a> <a style='text-decoration: none;font: menu;display: inline-block;padding: 2px 8px;background: ButtonFace;color: ButtonText;border-style: solid;border-width: 2px;border-color: ButtonHighlight ButtonShadow ButtonShadow ButtonHighlight;' href=" + url + "=no" + "> No </a>"
        }

        smtpTransport.sendMail(mail, function (error, response) {
            if (error) {
                console.log(error);
                callback({
                    'status': config.errorMessage
                    , 'message': config.internalServerErrorMessage
                });
            } else {
                console.log("Message sent: " + response.message);
                callback(response);
            }

            smtpTransport.close();
        });
    } catch (e) {
        console.log(e);
        callback({
            status: config.errorMessage
            , emailId: mailInfo.emailId
            , message: config.internalServerErrorMessage
        });
    }
}

var sendEmailV2 = function(mailInfo, sessionId, callback){
    try{
        var server = email.server.connect({
            user: config.smtpMailInfo.mailId
            , password: config.smtpMailInfo.password
            , host: "smtp.gmail.com"
            , ssl: true
        });
        
        var url = config.serverUrl + '/reply/' + '' + sessionId + "/" + new Buffer(mailInfo.emailId).toString('base64') + '/email' + '/?reply';
        
        var messageTobeSend = mailInfo.message + "<p>" + mailInfo.imageUrl + "</p> <p></p>";
        
        for(var i=0;i<config.smtpMailInfo.choices.length;i++){
            var message = config.smtpMailInfo.atagContent;
            messageTobeSend += message.replace('url', url + '='+ config.smtpMailInfo.choices[i]).replace('ButtonMessage', config.smtpMailInfo.choices[i]);
        }
        
        messageTobeSend += "<p></p><img src="+mailInfo.imageUrl+" style='height:200px;width:350px;' />";
        
        var message = {
            text: ""
            , from: config.smtpMailInfo.name + " <" + config.smtpMailInfo.mailId + ">"
            , to: mailInfo.emailId
            , subject: "SWF"
            , attachment: [
                {
                    alternative: true,
                    data: messageTobeSend
                }
//                ,
//                {
//                    path: process.cwd() + '/attachments/raj.jpg',
//                    type: "image/*",
//                    name: "product.jpg"
//                }
            ]
        };
        
        server.send(message, function (error, response) {
            if (error) {
                console.log(error);
                callback({
                    'status': config.errorMessage
                    , 'message': config.internalServerErrorMessage
                });
            } else {
                console.log("Message sent: " + JSON.stringify(response));
                callback(response);
            }
        });
    }catch(e){
        console.log(e);
        callback({
            status: config.errorMessage
            , emailId: mailInfo.emailId
            , message: config.internalServerErrorMessage
        });
    }
}

var sendMMS = function (info, sessionId, userId, callback) {
    try {
        var url = config.serverUrl + '/reply/' + '' + sessionId + "/" + new Buffer(info.number).toString('base64') + '/mms' +  '/?reply';
        var client = new twilio.RestClient(config.twilio.TWILIO_ACCOUNT_SID, config.twilio.TWILIO_AUTH_TOKEN);
        client.sms.messages.create({
            to: info.number
            , from: config.twilio.registeredMobile
            //, body: url + '=yes'
            , body: info.message + ' ' + info.imageUrl + ' To reply this message please type '+ userId + ' <SPACE> <YOUR MESSAGE>'
            , mediaUrl: info.imageUrl
        }, function (error, message) {
            if (!error) {
                callback(message);
            } else {
                callback({
                    status: config.errorMessage
                    , mobileNum: info.number
                });
            }
        });
    } catch (e) {
        console.log(e);
        callback({
            status: config.errorMessage
            , mobileNum: info.number
            , message: config.internalServerErrorMessage
        });
    }
}

var sendPushNotification = function (details, sessionId, callback) {
    try {
        var message = new gcm.Message();
        message.addNotification({
            title: 'Alert!!!'
            , body: 'Abnormal data access'
            , icon: 'ic_launcher'
            , data: {
                key1: 'msg1'
            }
        });

        //    var sender = new gcm.Sender('YOUR_API_KEY_HERE');
        //    var regTokens = ['YOUR_REG_TOKEN_HERE'];

        var sender = new gcm.Sender(config.pushNotification.android.serverAPIKey);
        var regTokens = ['YOUR_REG_TOKEN_HERE']; // reg token is deviceId of device

        sender.send(message, {
            registrationTokens: regTokens
        }, function (err, response) {
            if (err) console.error(err);
            else console.log(response);
        });
    } catch (e) {
        console.log(e)
        callback({
            status: config.errorMessage
            , mobileNum: info.number
            , message: config.internalServerErrorMessage
        });
    }
}

var notifySolebrity = function (details, sessionEnd, callback) {
    try {
        var options = {
            url: sessionEnd ? details.completeWebhookUrl : details.updateWebhookUrl
            , method: 'POST'
            , form: details
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(body);
            }else{
                console.log(error);
                callback(config.exceptionObj);
            }
        });
    } catch (e) {
        console.log(e);
        callback(config.exceptionObj);
    }
}

var cron = function () {
    console.log('Cron start');
    swfDAO.removeExpireSessions(function (result) {
        if (result) {
            result.forEach(function (details) {
                notifySolebrity(details, true, function (notificationResult) {
                    console.log(notificationResult);
                });
            });
        }
        console.log('Cron end number of expired session '+result.length);
    });
}

setInterval(cron, 1000 * 60);

module.exports = {
    validateSessionParams: validateSessionParams
    , validateNotifyFriendParams: validateNotifyFriendParams
    , createUUID: createUUID
    , notifyFriends: notifyFriends
    , notifySolebrity: notifySolebrity
}