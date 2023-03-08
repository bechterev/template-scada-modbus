import ModbusRTU  from 'modbus-serial';
import { DeviceWithParameters } from './cycles';
import { sendToQueue } from './worker';


const CYCLE_INTERVAL = Number(process.env.CYCLE_INTERVAL);
const MODBUS_PORT = Number(process.env.CYCLE_MODBUS_PORT);

interface DeviceData {
    device: string;
    values: any;
    parameters: any;
    time: number;
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

export async function run(data: [ip: string, deviceWithParameters: DeviceWithParameters]) {
    try {
        const [ip, deviceWithParameters] = data;
        const client = await createConnectModbus(ip);
        if (!client.isOpen) {
            throw new Error('ip address not connecte');
        }
        while (true) {
            await readFunctions(client, deviceWithParameters);
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

async function readFunctions(client: any, devices: DeviceWithParameters) {
  for (const [modbusAddress, parameters] of Object.entries(devices)) {
      const holdings: Register[] = await getHoldingPart(parameters);
      const inputs: Register[] = await getInputPart(parameters);
      if (holdings.length > 0) {
          const groups: Group = await getGroupParam(holdings);
          const valueGroups = await readHoldingRegisters(client, groups);

          const typestamp = Date.now();
          await sendDataToQueue({ device: modbusAddress, values: valueGroups, parameters: holdings, time: typestamp });
      }
      if (inputs.length > 0) {
          const groups: Group = await getGroupParam(inputs);
          const valueGroups = await readInputsRegisters(client, groups);

          const typestamp = Date.now();
          await sendDataToQueue({ device: modbusAddress, values: valueGroups, parameters: inputs, time: typestamp });
      }
  }
}

async function getGroupParam(params: Array<any>) {
    let groups: Array<any> = [];
    for (const param of params) {
        const matchIndex = groups.findIndex(group => group[0] === param.group);
        if (matchIndex !== -1) {
            groups[matchIndex][1].push({address: param.address, type: param.data_type});
        } else {
            groups.push([param.group, [{address: param.address, type: param.data_type}]]);
        }
    }
    return await getGroupAndAddress(groups);
}

async function getGroupAndAddress(groups: Array<[string, AddressType[]]>) {
  const groupWithAddress: { [key: string]: [number, number] } = {};
  for (const [groupName, group] of groups) {
    const maxAddress = await getMaxAddressInGroup(group);
    const addDoubleLastRegister = await checkDoubleLengthLastRegister(
      maxAddress
    );
    const startAddress = Math.min(...group.map(({ address }) => address)) - 1;
    const countReadAddress =
      Math.max(...group.map(({ address }) => address)) -
      startAddress +
      addDoubleLastRegister;
    groupWithAddress[groupName] = [startAddress, countReadAddress];
  }
  return groupWithAddress;
}

type AddressType = { address: number; type: string };

async function getMaxAddressInGroup(group: AddressType[]): Promise<AddressType> {
  const resolvedGroup = await Promise.all(group);
  return resolvedGroup.reduce((max: AddressType, current: AddressType) => {
    if (current.address > max.address) {
      return current;
    }
    return max;
  }, {address: -Infinity, type: 'uint16'});
}

async function checkDoubleLengthLastRegister(parameter: AddressType) {
  return parameter.type === "uint32" || parameter.type === "float32" ? 1 : 0;
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
      console.log(error);
  }
}

async function readInputsRegisters(modbus: any, groups: any) {
  try {
      const data = [];
      for (const [groupName, address] of Object.entries(groups)) {
          const registers = await modbus.readInputRegisters(groups[groupName][0], groups[groupName][1]);
          console.log('registerWrite',groups[groupName][0],groups[groupName][1], registers)
          data.push(registers);
      }
      return data;
  } catch (error) {
      console.log(error);
  }
}

async function sendDataToQueue(data: DeviceData) {
  try {
      await sendToQueue(`${data.device}`, data);
  } catch (error) {
      console.error(error);
  }
}
