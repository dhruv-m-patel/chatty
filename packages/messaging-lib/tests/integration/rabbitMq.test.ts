import {
  getMessageBroker,
  MessageBroker,
  BaseMessage,
  IConsumeMessage,
} from '../../src/index';

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const someTime: number = 1000;
const exchangeName1: string = 'test_exchange3';
const exchangeName2: string = 'test_exchange4';

interface MyMessage extends BaseMessage {
  header: string;
  message: string;
}
const msg: MyMessage = {
  message: 'hello world',
  header: 'header',
  sourceServiceName: 'myService',
  timestamp: '12345',
  correlationId: '122',
  requestId: '321',
};

describe('RabbitMQ Integration Test', () => {
  const url = 'amqp://localhost';
  let mBrokerC: MessageBroker;
  let mBrokerP: MessageBroker;
  let mBrokerC2: MessageBroker | null;
  let mBrokerP2: MessageBroker | null;

  afterEach(async () => {
    await mBrokerP.close();
    await mBrokerC.close();
    if (mBrokerC2) {
      await mBrokerC2.close();
      mBrokerC2 = null;
    }
    if (mBrokerP2) {
      await mBrokerP2.close();
      mBrokerP2 = null;
    }
  });

  it('Sends a message of hello world and recieves it from the queue', async () => {
    let message: MyMessage;
    message = {
      message: '',
      header: '',
      sourceServiceName: '',
      timestamp: '',
      correlationId: '',
      requestId: '',
    };
    function handler(msg: IConsumeMessage<MyMessage>) {
      message = msg.content;
    }
    const topic: string = 'HighFive Created';
    const topics: Array<string> = ['HighFive Created'];

    mBrokerC = await getMessageBroker(url);
    await mBrokerC.consume<MyMessage>(exchangeName1, topics, handler);

    mBrokerP = await getMessageBroker(url);
    await mBrokerP.createExchange(exchangeName1);
    await mBrokerP.publishMessage<MyMessage>(topic, msg);

    await wait(someTime);

    expect(message.message).toBe('hello world');
  });

  it('Sends 3 messages with different topics and consumer recieves only two topics', async () => {
    const producerTopics: Array<string> = [
      'HighFive Created',
      'HighFive Updated',
      'HighFive Deleted',
    ];
    const consumerTopics: Array<string> = [
      'HighFive Created',
      'HighFive Updated',
    ];
    const handledTopics: Array<string> = [];
    function handler(msg: IConsumeMessage<MyMessage>) {
      handledTopics.push(msg.fields.routingKey);
    }
    mBrokerC = await getMessageBroker(url);
    await mBrokerC.consume<MyMessage>(exchangeName1, consumerTopics, handler);

    mBrokerP = await getMessageBroker(url);
    await mBrokerP.createExchange(exchangeName1);
    producerTopics.forEach(async (topic: string) => {
      await mBrokerP.publishMessage<MyMessage>(topic, msg);
    });

    await wait(someTime);

    expect(handledTopics.length).toBe(2);
    expect(handledTopics[0]).toBe('HighFive Created');
    expect(handledTopics[1]).toBe('HighFive Updated');
  });

  it('Sends 3 messages with different topics and 2 consumers recieves all of them', async () => {
    const producerTopics: Array<string> = [
      'HighFive Created',
      'HighFive Updated',
      'HighFive Deleted',
    ];
    const consumerTopics: Array<string> = [
      'HighFive Created',
      'HighFive Updated',
      'HighFive Deleted',
    ];
    const handledTopics: Array<string> = [];
    const handledTopics2: Array<string> = [];
    function handler(msg: IConsumeMessage<MyMessage>) {
      handledTopics.push(msg.fields.routingKey);
    }
    function handler2(msg: IConsumeMessage<MyMessage>) {
      handledTopics2.push(msg.fields.routingKey);
    }
    mBrokerC = await getMessageBroker(url);
    await mBrokerC.consume<MyMessage>(exchangeName1, consumerTopics, handler);
    mBrokerC2 = await getMessageBroker(url);
    await mBrokerC2.consume<MyMessage>(exchangeName1, consumerTopics, handler2);

    mBrokerP = await getMessageBroker(url);
    await mBrokerP.createExchange(exchangeName1);
    producerTopics.forEach(async (topic: string) => {
      await mBrokerP.publishMessage<MyMessage>(topic, msg);
    });

    await wait(someTime);

    expect(handledTopics.length).toBe(3);
    expect(handledTopics[0]).toBe('HighFive Created');
    expect(handledTopics[1]).toBe('HighFive Updated');
    expect(handledTopics[2]).toBe('HighFive Deleted');

    expect(handledTopics2.length).toBe(3);
    expect(handledTopics2[0]).toBe('HighFive Created');
    expect(handledTopics2[1]).toBe('HighFive Updated');
    expect(handledTopics2[2]).toBe('HighFive Deleted');
  });

  it('Sends 3 messages with different topics and consumer1 recieves 2 topics and consumer2 recieves 1 topic', async () => {
    const producerTopics: Array<string> = [
      'HighFive Created',
      'HighFive Updated',
      'HighFive Deleted',
    ];
    const consumerTopics: Array<string> = [
      'HighFive Created',
      'HighFive Updated',
    ];
    const consumer2Topics: Array<string> = ['HighFive Deleted'];

    const handledTopics: Array<string> = [];
    const handledTopics2: Array<string> = [];
    function handler(msg: IConsumeMessage<MyMessage>) {
      handledTopics.push(msg.fields.routingKey);
    }
    function handler2(msg: IConsumeMessage<MyMessage>) {
      handledTopics2.push(msg.fields.routingKey);
    }
    mBrokerC = await getMessageBroker(url);
    await mBrokerC.consume<MyMessage>(exchangeName1, consumerTopics, handler);
    mBrokerC2 = await getMessageBroker(url);
    await mBrokerC2.consume<MyMessage>(
      exchangeName1,
      consumer2Topics,
      handler2
    );

    mBrokerP = await getMessageBroker(url);
    await mBrokerP.createExchange(exchangeName1);
    producerTopics.forEach(async (topic: string) => {
      await mBrokerP.publishMessage<MyMessage>(topic, msg);
    });

    await wait(someTime);

    expect(handledTopics.length).toBe(2);
    expect(handledTopics[0]).toBe('HighFive Created');
    expect(handledTopics[1]).toBe('HighFive Updated');

    expect(handledTopics2.length).toBe(1);
    expect(handledTopics2[0]).toBe('HighFive Deleted');
  });

  it('consumes messages from two producers', async () => {
    const producer1Topics: Array<string> = [
      'HighFive Created',
      'HighFive Updated',
      'HighFive Deleted',
    ];
    const producer2Topics: Array<string> = [
      'GoodCatches Deleted',
      'GoodCatches Updated',
      'GoodCatches Created',
    ];
    const consumerTopicsFromProdcuer1: Array<string> = [
      'HighFive Created',
      'HighFive Updated',
    ];
    const consumerTopicsFromProdcuer2: Array<string> = [
      'GoodCatches Created',
      'GoodCatches Deleted',
    ];
    const handledTopics: Array<string> = [];
    const handledTopics2: Array<string> = [];
    function handler(msg: IConsumeMessage<MyMessage>) {
      handledTopics.push(msg.fields.routingKey);
    }
    function handler2(msg: IConsumeMessage<MyMessage>) {
      handledTopics2.push(msg.fields.routingKey);
    }

    mBrokerC = await getMessageBroker(url);
    await mBrokerC.consume<MyMessage>(
      exchangeName1,
      consumerTopicsFromProdcuer1,
      handler
    );
    await mBrokerC.consume<MyMessage>(
      exchangeName2,
      consumerTopicsFromProdcuer2,
      handler2
    );

    mBrokerP = await getMessageBroker(url);
    await mBrokerP.createExchange(exchangeName1);
    producer1Topics.forEach(async (topic: string) => {
      await mBrokerP.publishMessage<MyMessage>(topic, msg);
    });

    mBrokerP2 = await getMessageBroker(url);
    await mBrokerP2.createExchange(exchangeName2);
    producer2Topics.forEach(async (topic: string) => {
      await mBrokerP2?.publishMessage<MyMessage>(topic, msg);
    });

    await wait(someTime);

    expect(handledTopics.length).toBe(2);
    expect(handledTopics[0]).toBe('HighFive Created');
    expect(handledTopics[1]).toBe('HighFive Updated');

    expect(handledTopics2.length).toBe(2);
    expect(handledTopics2[0]).toBe('GoodCatches Deleted');
    expect(handledTopics2[1]).toBe('GoodCatches Created');
    expect(mBrokerC.consumerQueues.size).toBe(2);
  });

  it('forceds one queue creation per topics set, regardless how many consume is called', async () => {
    let message: MyMessage;
    message = {
      message: '',
      header: '',
      sourceServiceName: '',
      timestamp: '',
      requestId: '',
      correlationId: '',
    };

    function handler(msg: IConsumeMessage<MyMessage>) {
      message = msg.content;
    }
    const topic: string = 'HighFive Created';
    const topics: Array<string> = ['HighFive Created'];

    mBrokerC = await getMessageBroker(url);
    await mBrokerC.consume<MyMessage>(exchangeName1, topics, handler);
    await mBrokerC.consume<MyMessage>(exchangeName1, topics, handler);

    mBrokerP = await getMessageBroker(url);
    await mBrokerP.createExchange(exchangeName1);
    await mBrokerP.publishMessage<MyMessage>(topic, msg);

    await wait(someTime);

    expect(message.message).toBe('hello world');
    expect(mBrokerC.consumerQueues.size).toBe(1);
  });

  it('does not allow consumer to subscribe twice to the same exchange', async () => {
    const handler1Result: Array<string> = [];
    const handler2Result: Array<string> = [];

    function handler1(msg: IConsumeMessage<MyMessage>) {
      let message: MyMessage = msg.content;
      handler1Result.push(message.message);
    }
    function handler2(msg: IConsumeMessage<MyMessage>) {
      const message: MyMessage = msg.content;
      handler2Result.push(message.message);
    }
    const topic: string = 'HighFive Created';
    const topics: Array<string> = ['HighFive Created'];
    const msg2: MyMessage = {
      message: 'hello world 2',
      header: 'header',
      sourceServiceName: 'myService',
      timestamp: '12345',
      correlationId: '111',
      requestId: '222',
    };
    mBrokerC = await getMessageBroker(url);
    mBrokerP = await getMessageBroker(url);
    await mBrokerP.createExchange(exchangeName1);

    await mBrokerC.consume<MyMessage>(exchangeName1, topics, handler1);
    await mBrokerP.publishMessage<MyMessage>(topic, msg);
    await wait(someTime);

    await mBrokerC.consume(exchangeName1, topics, handler2);
    await mBrokerP.publishMessage<MyMessage>(topic, msg2);
    await wait(someTime);

    expect(handler1Result.length).toBe(1);
    expect(handler1Result[0]).toBe('hello world');
    expect(handler2Result.length).toBe(1);
    expect(handler2Result[0]).toBe('hello world 2');
  });

  it('recieves any broadcast messages to all consumers', async () => {
    const handler1Result: Array<string> = [];
    const handler2Result: Array<string> = [];

    function handler1(msg: IConsumeMessage<MyMessage>) {
      const message: MyMessage = msg.content;
      handler1Result.push(message.message);
    }

    function handler2(msg: IConsumeMessage<MyMessage>) {
      const message: MyMessage = msg.content;
      handler2Result.push(message.message);
    }
    const topic: string = 'HighFive Created';
    const topics: Array<string> = ['HighFive Created'];

    mBrokerC = await getMessageBroker(url);
    mBrokerC2 = await getMessageBroker(url);

    mBrokerP = await getMessageBroker(url);
    await mBrokerP.createExchange(exchangeName1);

    await mBrokerC.consume<MyMessage>(exchangeName1, topics, handler1);
    await mBrokerC2.consume<MyMessage>(exchangeName1, topics, handler2);

    await mBrokerP.broadcast<MyMessage>(msg);
    await wait(someTime);

    expect(handler1Result.length).toBe(1);
    expect(handler1Result[0]).toBe('hello world');
    expect(handler2Result.length).toBe(1);
    expect(handler2Result[0]).toBe('hello world');
  });
});
