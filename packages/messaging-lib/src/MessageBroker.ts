import amqplib, { Connection, Channel, ConsumeMessage, Replies } from 'amqplib';
import { BaseMessage, IConsumeMessage } from './types';
export { ConsumeMessage };
interface MessageBrokerSubscription {
  queueName: string;
  topics: Array<string>;
}
export class MessageBroker {
  connection: Connection | null;
  channel: Channel | null;
  url: string;
  producerExchangeName: string;
  consumerQueues: Map<string, Array<MessageBrokerSubscription>>;
  constructor(url: string) {
    this.url = url;
    this.connection = null;
    this.channel = null;
    this.producerExchangeName = '';
    this.consumerQueues = new Map<string, Array<MessageBrokerSubscription>>();
  }

  async init() {
    this.connection = await amqplib.connect(this.url);
    this.channel = await this.connection.createChannel();
  }

  async broadcast<TMessage extends BaseMessage>(mesage: TMessage) {
    await this.publishMessage<TMessage>('broadcast', mesage);
  }

  async publishMessage<TMessage extends BaseMessage>(
    routingKey: string,
    message: TMessage
  ) {
    await this.channel?.publish(
      this.producerExchangeName,
      routingKey,
      Buffer.from(JSON.stringify(message))
    );
  }

  async createExchange(exchangeName: string): Promise<void> {
    this.producerExchangeName = exchangeName;
    await this.channel?.assertExchange(exchangeName, 'topic', {
      durable: false,
    });
  }

  async consume<TMessage>(
    exchangeName: string,
    topics: Array<string>,
    handler: (msg: IConsumeMessage<TMessage>) => void
  ): Promise<void> {
    if (!topics.includes('broadcast')) topics.push('broadcast');
    await this.channel?.assertExchange(exchangeName, 'topic', {
      durable: false,
    });
    const queue:
      | Replies.AssertQueue
      | undefined = await this.channel?.assertQueue('', {
      exclusive: true,
      durable: true,
    });
    if (queue) {
      topics.forEach(
        async (topic: string): Promise<void> => {
          await this.channel?.bindQueue(queue.queue, exchangeName, topic);
        }
      );

      await this.channel?.consume(
        queue.queue,
        function (msg: ConsumeMessage | null) {
          if (msg) {
            const messageContent: TMessage = JSON.parse(msg.content.toString());
            const message: IConsumeMessage<TMessage> = {
              fields: msg.fields,
              properties: msg.properties,

              content: messageContent,
            };
            handler(message);
          }
        },
        { noAck: true }
      );
      const subscription: MessageBrokerSubscription = {
        queueName: queue.queue,
        topics,
      };
      const subscriptions: Array<MessageBrokerSubscription> =
        this.consumerQueues.get(exchangeName) || [];
      if (this.consumerQueues.has(exchangeName)) {
        const index: number = subscriptions.findIndex((subscription) =>
          topics.every((topic) => subscription.topics.includes(topic))
        );
        if (index !== -1)
          await this.channel?.deleteQueue(subscriptions[index].queueName);
        subscriptions.splice(index, 1);
      }
      subscriptions.push(subscription);
      this.consumerQueues.set(exchangeName, subscriptions);
    }
  }

  async close() {
    await this.channel?.close();
    await this.connection?.close();
  }
}

export async function getMessageBroker(url: string): Promise<MessageBroker> {
  const newMBroker = new MessageBroker(url);
  await newMBroker.init();
  return newMBroker;
}
