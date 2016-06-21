// Check server Availability
/**
  * @api {get} /api/v1/
  * @apiName checkServer
  * @apiDescription Service will be used to check server is up or not
  * @apiGroup Check Server
  * @apiVersion 1.0.0
  *
  * @apiSuccess {String}  msg               ***** Shop With Friends (SWF) *****
*/

// Create Session
/**
  * @api {post} /api/v1/createSession
  * @apiName createSession
  * @apiDescription Service will be used to create user session.
  * @apiGroup Create Session
  * @apiVersion 1.0.0
  * @apiParam {String/Number}  userId            id of the user
  * @apiParam {String}  productName              product name
  * @apiParam {String}  sku                      sku of product
  * @apiParam {String}  imageUrl                 product image
  * @apiParam {String}  updateWebhookUrl         url to notify solebrity about frds response
  * @apiParam {String}  completeWebhookUrl       url to notify solebrity when session ends.
  * @apiParam {Number}  sessionDuration          duration of the session 
  *
  * @apiSuccess {String}  status        success
  * @apiSuccess {String}  sessionId     {your sessionId}
  * @apiSuccess {String}  message       Session Created Successfully
  *
  * @apiError {String}  message       {error message}
  * @apiError {Number}  status        error
*/

// notify friends
/**
  * @api {get} /api/v1/session/:sessionId/notify
  * @apiName save and notify friends
  * @apiDescription Service will be used save friends details and notify friends via email, mms, push notification
  * @apiGroup Save And Notify Friends
  * @apiVersion 1.0.0
  *
  * @apiParam {String}  users            {'mms':{'number':'12345678', 'message': 'how ?', imageUrl:''}, 'email':{'message': '', imageUrl:'', 'number': ''}, 'pushNotification':{'deviceId':'', message:'', imageUrl:''}}
  *
  * @apiSuccess {String}  status        array of object contains info about mail, mms, pushNotification
  *
  * @apiError {String}  message       {error message}
  * @apiError {Number}  status        error
*/


// Recieve response from friends

/**
  * @api {get} /api/v1/reply/:sessionId/:contact/:type
  * @apiName Save and notify solebrity friends response
  * @apiDescription Service will be used save friends details and notify friends via email, mms, push notification
  * @apiGroup Save and notify solebrity friends response
  * @apiVersion 1.0.0
  *
  * @apiParam {String}   twilio-Email-PushNotification        {twilioResponse, emailResponse, pushNotificationResponse}            
  *
  * @apiSuccess {String}  String        Thanks for replying
  *
  * @apiError {Number}  status        4**
*/