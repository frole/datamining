from azure.storage import BlobService
from azure.servicebus import Message
from azure.servicebus import ServiceBusService

import json
import sys

with open('./config.json') as cfg  :
    config=json.load(cfg)
serviceBusNamespace=config["serviceBusNamespace"] 
serviceBusAccessKey=config["serviceBusAccessKey"]


sbClient = ServiceBusService(serviceBusNamespace,
                        account_key=serviceBusAccessKey,
                        issuer="owner")

queueName=config["queueName"]
sbClient.delete_queue(queueName)
sbClient.create_queue(queueName)

try :
    
##    while True :
        #sbClient.create_queue(queueName)
        #msg = sbClient.receive_queue_message('servicerequest',peek_lock=False)
        #msg=sbClient.read_delete_queue_message(queueName)

        lock_info=sbClient.peek_lock_queue_message(queueName, timeout='60')
        for p in lock_info  :
            print lock_info[p]
##        sbClient.delete_queue_message(self, queue_name, sequence_number, lock_token)
##        print "Received: "  , msg
##
##        sbClient.send_queue_message('servicerequest', Message("OK. I have received the message!"))
##
##        print "Sent: " , msg
##        #sbClient.delete_queue(queueName)
##
##        #BrokerProperties['SequenceNumber']
##        #peek_lock_queue_message(self, queue_name, timeout='60'):
##       

except KeyboardInterrupt:
    sys.exit(0)




#blob_service = BlobService(account_name, account_key)
#blob_service.create_container('images')
