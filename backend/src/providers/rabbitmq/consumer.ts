import * as amqp from 'amqplib';
import { closeConnection, createConnection } from './connection.js';

interface ConsumeOptions {
  queue: string;
}

interface Notification {
  userId: string;
  message: string;
}

export async function consumeSignupNotifications(): Promise<void> {
  const options: ConsumeOptions = {
    queue: 'signup_notifications',
  };
  const connection = await createConnection({
    host: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
  });
  const channel = await connection.createChannel();
  await channel.assertQueue(options.queue, { durable: false });
  await channel.consume(options.queue, (msg) => {
    if (msg !== null) {
      const notification: Notification = JSON.parse(msg.content.toString());
      console.log(`Received signup notification: ${notification.message} for user ${notification.userId}`);
      // Send the notification to the user (e.g., via email or push notification)
      // For example:
      // sendEmail(notification.userId, notification.message);
      channel.ack(msg);
    }
  });
  console.log('Waiting for signup notifications...');
}

export async function consumeLoginNotifications(): Promise<void> {
  const options: ConsumeOptions = {    
    queue: 'login_notifications',
  };
  const connection = await createConnection({
    host: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
  });
  const channel = await connection.createChannel();
  await channel.assertQueue(options.queue, { durable: false });
  await channel.consume(options.queue, (msg) => {
    if (msg !== null) {
      const notification: Notification = JSON.parse(msg.content.toString());
      console.log(`Received login notification: ${notification.message} for user ${notification.userId}`);
      channel.ack(msg);
    }
  });
  console.log('Waiting for login notifications...');
}

async function main() {
  await Promise.all([consumeSignupNotifications(), consumeLoginNotifications()]);
}

main();