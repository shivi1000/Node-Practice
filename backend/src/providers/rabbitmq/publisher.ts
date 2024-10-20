import * as amqp from 'amqplib';
import { closeConnection, createConnection } from './connection.js';

interface PublishOptions {
  exchange: string;
  routingKey: string;
  message: string;
}

export async function publishMessage(options: PublishOptions): Promise<void> {
  const { exchange, routingKey, message } = options;
  const connection = await createConnection({
    host: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
  });
  const channel = await connection.createChannel();
  await channel.assertExchange(exchange, 'direct', { durable: false });
  await channel.publish(exchange, routingKey, Buffer.from(message));
  console.log('Message published!');
  await closeConnection(connection);
}

async function main() {
  const options: PublishOptions = {
    exchange: 'my_exchange',
    routingKey: 'my_routing_key',
    message: 'Hello, RabbitMQ!',
  };
  await publishMessage(options);
}

main();