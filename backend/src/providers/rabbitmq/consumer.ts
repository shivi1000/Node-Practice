import * as amqp from 'amqplib';
import { createConnection } from './connection.js';
interface ConsumeOptions {
  queue: string;
}

export async function consumeMessage(options: ConsumeOptions): Promise<void> {
  const { queue } = options;
  const connection = await createConnection({
    host: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
  });
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  await channel.consume(queue, (msg) => {
    if (msg !== null) {
      console.log('Received message:', msg.content.toString());
      channel.ack(msg);
    }
  });
  console.log('Waiting for messages...');
}

async function main() {
  const options: ConsumeOptions = {
    queue: 'my_queue',
  };
  await consumeMessage(options);
}

main();