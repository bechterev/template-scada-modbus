import ModbusRTU  from 'modbus-serial';
import { sendToQueue } from './worker';


const CYCLE_INTERVAL = Number(process.env.CYCLE_INTERVAL);
const MODBUS_PORT = Number(process.env.CYCLE_MODBUS_PORT);

interface DeviceData {
    device: string;
    values: any;
    parameters: any;
}

interface Device {
  device: string;
  parameters: any;
}

interface Group {
  [key: string]: [number, number];
}

interface Register {
  group: string;
  address: number;
  read_func: number;
}

export async function run(data: [ip: string, devices: Device[]]) {
    try {
        const [ip, devices] = data;
        const client = await createConnectModbus(ip);
        if (!client.isOpen) {
            throw new Error('ip address not connecte');
        }
        while (true) {
            await readFunctions(client, devices);
            await new Promise((resolve) => setTimeout(resolve, CYCLE_INTERVAL));
        }
    } catch (error) {
        console.log(error);
    }
}

async function createConnectModbus(ip: string) {
    const modbus = new ModbusRTU();
    await modbus.connectTCP(ip, { port: MODBUS_PORT });
    return modbus;
}

async function readFunctions(client: ModbusRTU, devices: Device[]) {
  for (const device of devices) {
      const holdings: Register[] = await getHoldingPart(device.parameters);
      const inputs: Register[] = await getInputPart(device.parameters);
      if (holdings.length > 0) {
          const groups: Group = await getGroupParam(holdings);
          const valueGroups = await readHoldingRegisters(client, groups);
          await sendDataToQueue({ device: device.device, values: valueGroups, parameters: holdings });
      }
      if (inputs.length > 0) {
          const groups: Group = await getGroupParam(inputs);
          const valueGroups = await readInputsRegisters(client, groups);
          await sendDataToQueue({ device: device.device, values: valueGroups, parameters: inputs });
      }
  }
}

async function getGroupParam(params: Array<any>) {
    let groups: Array<any> = [];
    for (const param of params) {
        const matchIndex = groups.findIndex(group => group[0] === param.group);
        if (matchIndex !== -1) {
            groups[matchIndex][1].push(param.address);
        } else {
            groups.push([param.group, [param.address]]);
        }
    }
    return await getGroupAndAddress(groups);
}

async function getGroupAndAddress(groups: Array<any>) {
    let groupWithAddress: any = {};
    for (const group of groups) {
        const startAddress = Math.min(...group[1]) - 1;
        const countReadAddress = Math.max(...group[1]) - Math.min(...group[1]) + 1;
        groupWithAddress[group[0]] = [startAddress, countReadAddress];
    }
    return groupWithAddress;
}

async function getHoldingPart(data: Register[]): Promise<Register[]> {
  return data.filter(object => {
      if (object.read_func === 3) return object;
  });
}

async function getInputPart(data: Register[]): Promise<Register[]> {
  return data.filter(object => {
      if (object.read_func == 4) return object;
  })
}

async function readHoldingRegisters(modbus: any, groups: any) {
  try {
      const data = [];
      for (const [groupName, address] of Object.entries(groups)) {
          const registers = await modbus.readHoldingRegisters(groups[groupName][0], groups[groupName][1]);
          data.push(registers);
      }
      return data;
  } catch (error) {
      console.error(error);
  }
}

async function readInputsRegisters(modbus: any, groups: any) {
  try {
      const data = [];
      for (const [groupName, address] of Object.entries(groups)) {
          const registers = await modbus.readInputRegisters(groups[groupName][0], groups[groupName][1]);
          data.push(registers);
      }
      return data;
  } catch (error) {
      console.error(error);
  }
}

async function sendDataToQueue(data: DeviceData) {
  try {
      await sendToQueue(`${data.device}`, data);
  } catch (error) {
      console.error(error);
  }
}
