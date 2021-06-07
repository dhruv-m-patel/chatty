import { ConsumeMessageFields, MessageProperties } from 'amqplib';
export interface BaseMessage {
  sourceServiceName: string;
  timestamp: string;
  requestId: string;
  correlationId: string;
}

export interface IConsumeMessage<TMessage> {
  fields: ConsumeMessageFields;
  properties: MessageProperties;
  content: TMessage;
}
