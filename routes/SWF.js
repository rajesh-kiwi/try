var router = require('express').Router();

var swfController = require('../controllers/swfController');

router.get('/', swfController.getHomePage);

router.post('/createSession', swfController.createSession);

router.get('/session/:sessionId', swfController.getSessionDetails);

router.post('/session/:sessionId/notify', swfController.saveAndNotifyFriends);

router.get('/reply/:sessionId/:contact/:type', swfController.saveAndNotifyFriendsResponses);

router.post('/update/callback', swfController.solebrityUpdateCallback);

router.post('/complete/callback', swfController.solebrityCompleteCallback);

module.exports = router;