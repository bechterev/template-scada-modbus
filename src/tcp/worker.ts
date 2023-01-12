import client, {Connection, Channel, ConsumeMessage} from 'amqplib';
import { analize } from './analize';

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
    // Создаем соединение с RabbitMQ
    await createConnection();
    // Создаем канал
    const channel = await connection.createChannel();
    // Объявляем очередь
    await channel.assertQueue(queueName, {
      durable: true // очередь должна сохраняться на диске, чтобы не потерять сообщения при падении сервера
    });
    // Отправляем сообщение в очередь
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      persistent: true // сообщение должно сохраняться на диске, чтобы не потерять его при падении сервера
    });
    receiveFromQueue(queueName)

  } catch (error) {
    console.error(error);
  }
}


async function receiveFromQueue(queueName: string) {
  try {
    
    await createConnection();
    // Объявляем очередь
    await channel.assertQueue(queueName, {
      durable: true // очередь должна сохраняться на диске, чтобы не потерять сообщения при падении сервера
    });
    // Получаем сообщение из очереди
    const message = await channel.get(queueName);

    if (message) {
      
      await analize(message.content.toString())
      // Подтверждаем получение сообщения
      await channel.ack(message);
    }

  } catch (error) {
    console.error(error);
  }
}
