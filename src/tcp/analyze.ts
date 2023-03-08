import { PollParameter } from './cycles';

interface RawData {
  device: string;
  values: Array<AnswerModbus>;
  parameters: PollParameter[];
  time: number;
}

interface AnswerModbus {
  data: number[];
  buffer: Buffer[];
}

const bigDataTypes = ['float32', 'uint32'];

export const analyze = async (data: string) => {
  const rawData: RawData = JSON.parse(data);
  let indexParameter = 0;

  for (const value of rawData.values) {
    for (let i = 0; i < value.data.length; i++) {
      const data1 = value.data[i];
      const data2 = value.data[i + 1];
      if (bigDataTypes.includes(rawData.parameters[indexParameter].data_type)) {
        await definitionByteOrder(
          rawData.device,
          rawData.parameters[indexParameter],
          rawData.time,
          data1,
          data2
        );
        i += 1;
      } else {
        await definitionByteOrder(
          rawData.device,
          rawData.parameters[indexParameter],
          rawData.time,
          data1
        );
      }
      indexParameter++;
    }
  }
};

const definitionByteOrder = async (
  device: string,
  parameter: PollParameter,
  time: number,
  value: number,
  valueNext?: number
) => {  
  if (!valueNext) {
    addCoefficient(device, value, parameter, time);
  } else {
    console.log(value, valueNext);
    const data = getBigValue(
      value,
      valueNext,
      parameter.byte_order,
      parameter.data_type
    );
    addCoefficient(device, data, parameter, time);
  }
};

const getBigValue = (
  value1: number,
  value2: number,
  byteOrder: number,
  dataType: string
) => {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);

  if (byteOrder === 1) {
    view.setUint16(0, value2, true);
    view.setUint16(2, value1, true);
  } else if (byteOrder === 2) {
    view.setUint16(2, value2, true);
    view.setUint16(0, value1, true);
  }
  if (dataType === bigDataTypes[0]) {
    return view.getFloat32(0, true);
  } else {
    return view.getUint32(0, true);
  }
};

const addCoefficient = (
  device: string,
  value: number,
  parameter: PollParameter,
  time: number
) => {
  let newValue = value * parameter.coef;
  console.log(
    `${device} ${parameter.alias} ${parameter.read_func} ${newValue}`
  );
};
