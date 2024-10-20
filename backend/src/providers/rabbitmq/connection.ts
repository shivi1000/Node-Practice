import * as amqp from 'amqplib';

interface ConnectionOptions {
  host: string;
  port: number;
  username: string;
  password: string;
}

export async function createConnection(options: ConnectionOptions): Promise<amqp.Connection> {
  const { host, port, username, password } = options;
  const url = `amqp://${username}:${password}@${host}:${port}`;
  return amqp.connect(url);
}

export async function closeConnection(connection: amqp.Connection): Promise<void> {
  await connection.close();
}