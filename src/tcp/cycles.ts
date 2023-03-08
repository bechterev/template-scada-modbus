import DatabaseService from '../services/db';
import 'reflect-metadata';
import client, { Connection, Channel } from 'amqplib';
import { groupByProperty, sortByProperty } from '../common/util';
import { run } from './reader';
import { values, flattenDeep, toPairs, map } from 'lodash';

export type PollParameter = {
  id: string,
  ip: string,
  modAddress: number,
  address: number,
  read_func: number,
  write_func: number,
  data_type: string,
  coef: number,
  byte_order: number,
  group: string,
  alias: string,
};

interface DeviceParamter {
  id: string;
  ip: string;
  modAddress: number;
  address: number;
  read_func: number;
  write_func: number;
  data_type: string;
  coef: number;
  byte_order: number;
  group: string;
  alias: string;
}
export interface DeviceWithParameters {
  [modbusAddressDevice: string]: Array<DeviceParamter>;
}
interface IpDevices {
  [ip: string]: Array<DeviceParamter>;
}

export class Load {
  constructor(private dbService: DatabaseService) { }
  private connectionRabbit: Connection = undefined;

  async initializeProtocol(): Promise<PollParameter[]> {
    const protocolType = await this.dbService.getProtocolsByName('modbus-tcp');

    if (!protocolType) {
      throw new Error('protocol not exist');
    }

    return await this.dbService.initStartData(protocolType);
  }

  async sendToQueue(data: string) {
    const channel: Channel = await this.connectionRabbit.createChannel();
    await channel.assertQueue(process.env.CYCLE_QUEUE_NAME);
    channel.sendToQueue(process.env.CYCLE_QUEUE_NAME, Buffer.from(data));
  }

  async analyzeInitialData() {
    const data: PollParameter[] = await this.initializeProtocol();
   
    if (data.length > 0) {
      const groupedAndSortedData = await this.groupAndSortData(data);
      groupedAndSortedData.map((ip: [ip: string, deviceWithParameters: DeviceWithParameters]) => run(ip));
    } else {
      throw new Error('no polling devices');
    }
  }

  async groupAndSortData(data: PollParameter[]) {
    const groupedByIp: IpDevices = await groupByProperty(data, 'ip');
    
    const groupedByIpAndDevice = await Promise.all(
      Object.entries(groupedByIp).map(async (ip) => {
        const sortedByProperties: DeviceParamter[] = await sortByProperty(ip[1], 'modAddress', 'group', 'address');
        const groupedByModAddress: DeviceWithParameters = await groupByProperty(sortedByProperties, 'modAddress');
        
        return [ip[0], groupedByModAddress]      
      })
    );

    return groupedByIpAndDevice;
  }
}