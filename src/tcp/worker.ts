import client, {Connection, Channel, ConsumeMessage, Message} from 'amqplib';
import { analyze } from './analyze';

let connection: Connection;
let channel: Channel;

async function createConnection() {
  if (!connection) {
    connection = await client.connect(process.env.RABBIT_URL);
    channel = await connection.createChannel();
  }
}

export async function sendToQueue(queueName: string, data: any) {
  try {
    await createConnection();
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {
      durable: true 
    });

    const stringData = JSON.stringify(data);

    await channel.sendToQueue(queueName, Buffer.from(stringData), {
      persistent: true 
    });
    
    await receiveFromQueue(queueName);
  } catch (error) {
    console.log(error);
  }
}

export async function receiveFromQueue(queueName: string) {
  try {
    await createConnection();
    await channel.assertQueue(queueName, {
      durable: true,
    });

    channel.consume(queueName, async(msg: Message) => {
      if (msg) {
        await analyze(msg.content.toString());
        channel.ack(msg);
      }
    })

  } catch (error) {
    console.log(error);
  }
}
