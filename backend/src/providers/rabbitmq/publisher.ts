import * as amqp from 'amqplib';
import { closeConnection, createConnection } from './connection.js';

interface PublishOptions {
  exchange: string;
  routingKey: string;
  message: string;
}

export interface SignupNotification {
  userId: string;
  message: string;
}
export interface LoginNotification {
  userId: string;
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

export async function sendSignupNotification(notification: SignupNotification): Promise<void> {
  const options: PublishOptions = {
    exchange: 'notifications',
    routingKey: 'user_signup',
    message: JSON.stringify(notification),
  };
  await publishMessage(options);
}

export async function sendLoginNotification(notification: LoginNotification): Promise<void> {
  const options: PublishOptions = {
    exchange: 'notifications',
    routingKey: 'user_login',
    message: JSON.stringify(notification),
  };
  await publishMessage(options);
}

async function main() {
  const signupNotification: SignupNotification = {
    userId: 'user123',
    message: 'Congratulations! You have successfully signed up.',
  };
  await sendSignupNotification(signupNotification);

  const loginNotification: LoginNotification = {
    userId: 'user123',
    message: 'You have successfully logged in.',
  };
  await sendLoginNotification(loginNotification);
}

main();