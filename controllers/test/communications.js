var azure = require('azure');




exports.serviceBusFunction= function (req, res) {
  /*
  sbClient= azure.createServiceBusService() ;
  
   sbClient.createQueueIfNotExists('servicerequest' , function(error) {
                                if (error) {
                                   console.log(error);
                                }
                                else {
                                 console.log("Queue already existed or has been created" );
                               }

                    }
   ); 
   */
  res.render('test/testServiceBus');
  }
