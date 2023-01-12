import DatabaseService from '../services/db';
import 'reflect-metadata';
import client, { Connection, Channel } from 'amqplib';
import { groupByProperty, sortByProperty } from '../common/util';
import { run } from './reader';

export class Load {
  constructor( private dbService: DatabaseService ) {}
  private connectionRabbit: Connection = undefined;

  async start() {
    const protocolId = await this.dbService.getProtocolsByName('modbus-tcp');
   
    if (!protocolId) {
      throw new Error('protocol not exist')
    }
    
/*     this.connectionRabbit = await client.connect(
      process.env.RABBIT_URL
    ) */
    return await this.dbService.initStartData(protocolId)
  }

  async worker(data: string) {

    // Create a channel
    const channel: Channel = await this.connectionRabbit.createChannel()

    // Makes the queue available to the client
    await channel.assertQueue(process.env.CYCLE_QUEUE_NAME)

    //Send a message to the queue
    channel.sendToQueue(process.env.CYCLE_QUEUE_NAME, Buffer.from(data))
  }

  async analizeInitData() {
    const data: any = await this.start();
    
    if (data.length > 0) {
      const dataGropSort = await this.generateGroupPool(data);
      dataGropSort.map((ip: [ip: string, devices: Array<any>]) => run(ip))
    } else throw new Error('no polling devices')
  }
  async generateGroupPool(data: Array<any>) {

    const groupRawByIp = await groupByProperty(data,'ip');

    const groupByIpAndDevice = await Promise.all(Object.entries(groupRawByIp).map(async(ip) => {
      const valueSort = await sortByProperty(ip[1],'modAddress','group','address')
      
      const value = await groupByProperty(valueSort,'modAddress')
      
      ip[1] = [value];
      return ip;
    }))
    console.log(JSON.stringify(groupByIpAndDevice))
    return groupByIpAndDevice;
  }
  
}
