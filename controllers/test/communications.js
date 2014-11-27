var azure = require('azure');


var config = require('./config')

exports.serviceBusFunction= function (req, res) {
 
  var sbClient= azure.createServiceBusService(config.serviceBusNamespace, config.serviceBusAccessKey) ;

  var queueOptions = {
      MaxSizeInMegabytes: '5120',
      DefaultMessageTimeToLive: 'PT1M'
    };

   sbClient.deleteQueue('servicerequest'  , function(error) {
                                if (error) {
                                   console.log(error);
                                }
                                else {
                                 console.log("Queue already existed or has been created" );
                               }

                    });
  
   sbClient.createQueueIfNotExists('servicerequest' , queueOptions , function(error) {
                                if (error) {
                                   console.log(error);
                                }
                                else {
                                 console.log("Queue already existed or has been created" );
                               }

                    }
   ); 

  var message="first message" ;

   sbClient.sendQueueMessage('servicerequest' ,  message, function(error) {
        if (error) {
                    console.log(error);
                }
        else {
            console.log("Message " + message + " has been sent") ;
         }     
        });

   millis=3000;
   var date = new Date();
   var curDate = null;
   do { curDate = new Date(); }
   while(curDate-date < millis);



   sbClient.receiveQueueMessage('servicerequest' ,  { isPeekLock: false } ,function(error,message) {
        if (error) {
                    console.log(error);
                }
        else {
            console.log("Message " + message.body + " has been received") ;
         }     
      });

   
  
  res.render('test/testServiceBus');
  }
