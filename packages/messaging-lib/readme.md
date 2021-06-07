
# **How to consume this library**

You have to create a message broker object out of `MessageBroker` class. To create an instance use the `getMessageBroker(url: string)` function, where url is the RabbitMQ server host url.
MessageBroker can work with any type of messages. The type should extend BaseMessage interface however.

## Message type
	import {BaseMessage} from '@alcumus/messaging-lib'
	class MyMessage extends BaseMessage {...}
	// or
	interface MyMessage extends BaseMessage {...}
## Producer
	import {MessageBroker} from '@alcumus/messaging-lib'
    const url = 'amqp://localhost'; // assuming the server is hosted locally.
    const exch: string = 'ServiceExchange';
    const msg: MyMessage = {...} 
    const rkey: string = 'topic' // the topic or event the above message is related to
    
    const messageBroker: MessageBroker = await getMessageBroker(url);
    await messageBroker.createExchange(exch);
    await messageBroker.publishMessage<MyMessage>(rkey, msg);

## Consumer
    import {IConsumeMessage, MessageBroker} from '@alcumus/messaging-lib'
    const url = 'amqp://localhost'; // assuming the server is hosted locally.
    const exch = 'ServiceExchange';
    const topics = ['topic1', 'topic2']; // topics the consumer is interested in
    
    function handler (msg: IConsumeMessage<MyMessage>) {
    console.log('topic: ', msg.fields.routingKey);
    const content: MyMessage = msg.content
    console.log('content: ', content);
    }
    
    const messageBroker: MessageBroker = await getMessageBroker(url)
    await messageBroker.consume<MyMessage>(exch, topics, handler);

the messageBroker class makes sure that only one queue is created per topics set. This means if the same consumer tried to consume the same topics from the same exchange twice, only one queue is available. this ensures efficient resource utilization. Consumers can use this technique to change the handler of a set of interesting topics. The message broker class will check if there is a queue already exists for a certain topic set. If available it will remove existing queue and creates a new one with the same topics. it assumes the client is changing the handler
  

## Topics Structure
The topic (routing keys) pattern that can be used is as follows:
**applicationName.serviceName.entity.action**

Examples

*wildbreeze.highFive.HFD.added
wildbreeze.highFive.note.modified
wildbreeze.highFive.reaction.deleted
wildbreeze.users.user.added
wildbreeze.users.user.offline*

Consumers can subscribe to any level of topics using the &ast; and # masking options.

 - (&ast;) can substitute for exactly one word.
 - (#) can substitute for zero or more words.

Consumer examples

 1. **All highFive service messages**: wildbreeze.highFive.&ast;.&ast;
 2. **Any added messages from any service**: #.added
 3. **All messages related to reaction**: wildbreeze.highFive.reaction.&ast;

## Closure

at the end you need to call `.close()` method to close the connections to the RabbitMQ server

Refer to the `examples` folder under `src` for full code.
