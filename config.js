module.exports = {
    successMessage: 'success'
    , errorMessage: 'error'
    , internalServerErrorMessage: 'Internal Server Problem'
    , missingParametersErrorMessage: 'Missing Parameters'
    , invalidValueMessage: 'Invalid Value'
    , sessionCreatedSuccessMessage: 'Session Created Successfully'
    , sessionNotFoundMessage: 'Session Not found'
    , serverPath: '/api/v1/'
    , replyMailFormUrl: 'http://localhost:3000/api/v1/friendReply/'
    , serverUrl: 'http://localhost:3000' + this.serverPath
    , userFrdsDetailsNotFoundMessage: 'user friends details not found'
    , detailsExistsMessage: 'Details already exists'
    , responseThankuMessage: 'Thanks for replying'
    , lostMongoConnection: 'not able set connection with mongodb'
    , serverFiles: {
        config: process.cwd() + '/config.js',
        swfRoute: process.cwd() + '/routes/SWF.js'
    }
    , apiVersions: {
        v1: '/api/v1'
    }
    ,
    , exceptionObj: {
        status: 'error'
        , message: 'Internal Server Problem'
    }
    , mongoDB: {
        url: 'mongodb://localhost:27017/SWF'
        , collections: {
            user: 'swf_users'
        }
    }
    , pushNotification: {
        android: {
            serverAPIKey: 'AIzaSyC9kvz-WoEcK9_T8w1k-m3k3vllAwzAJDI'
            , senderId: '1007457184720'
        }
    }
    , smtpMailInfo: {
        mailId: 'testingcase2016@gmail.com'
        , name: 'test test'
        , password: 'kiwitech'
        , atagContent: "<a style='text-decoration: none;font: menu;display: inline-block;padding: 2px 8px;background: ButtonFace;color: ButtonText;border-style: solid;border-width: 2px;border-color: ButtonHighlight ButtonShadow ButtonShadow ButtonHighlight;' href='url'>  ButtonMessage </a>"
        , choices: ['Yes', 'No', 'MayBe']

    }
    , twilio: {
        'TWILIO_ACCOUNT_SID': 'AC9ba87e0f81da96c509f4ae56a5fb0881'
        , 'TWILIO_AUTH_TOKEN': '0b8f7fdc4734b057f980ec9ae6dfe4c3'
        , registeredMobile: '+15615363780'
    }
    , formalCallBackObject: {
        status: ''
        , message: ''
    }
    , createSessionParams: {
        userId: true
        , sessionDuration: true
        , productName: true
        , sku: true
        , imageUrl: true
        , updateWebhookUrl: true
        , completeWebhookUrl: true
    }
    , notifyFriendsMethods: {
        mms: {
            number: true
            , message: true
            , imageUrl: true
        }
        , email: {
            emailId: true
            , message: true
            , imageUrl: true
        }
        , pushNotification: {
            deviceId: true
            , message: true
            , imageUrl: true
        }
    }
    , notificationMethodMap: {
        email: 'emailId'
        , mms: 'number'
        , pushNotification: 'deviceId'
    }
    , setUrl: function (url) {
        this.serverUrl = url + this.serverPath
    }
}