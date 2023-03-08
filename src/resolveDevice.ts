import knex from 'knex'
import { generateToken, User, verifyPassword, verifyToken } from './auth';
import db from './database/dataBaseConnect'
import DatabaseService from './services/db';

const dbService = new DatabaseService();
export const resolvers = {
  
  Mutation: {
    createDevice: async(_: any, { name, production, protocol, ip, modAddress }:
      { name: string, production: string, protocol: string, ip: string, modAddress: number }) => {
      const device = await knex("devices")
      .returning("*")
      .insert({ name, production, ip, modAddress });

      return device;
    },

    createProtocol: async(_: any, { description, production }: {description: string, production: string}) => {
      const protocol = await knex("protocols")
      .returning("*")
      .insert({ description, production });

      return protocol;
    },

    createProtocolType: async(_: any, { name }: {name: string }) => {
      const protocolType = await knex("protocolTypes")
      .returning("*")
      .insert({ name });

      return protocolType;
    },

    createProtocolParameter: async(_: any, { protocol, alias, address, read_func,
      write_func, data_type, coef, byte_order }: { protocol: string, alias: string, address: number,
      read_func: number, write_func: number, data_type: string, coef: number, byte_order: number }) => {
        const protocolParameter = await knex("protocolParameters")
        .returning("*")
        .insert({ protocol, alias, address, read_func, write_func, data_type, coef, byte_order });

        return protocolParameter;
      },

    login: async (_: any, { email, password }: {email: string, password: string}) => {
      const user: User = await dbService.checkUser(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      const token = generateToken(user);
      user.token = token

      return {
        ...user
      };
    },
  },

  Query: {
    devices: async(_: any, {}) => {
      return await db.select("*").from("devices");
    },
    device: async(_: any, { id }: { id: string }) => {
      const result = await db.select("*").from("devices").where({ id }).first();
      return result;
    },
    protocols: async(_: any, {}) => {
      return await db.select("*").from("protocols");
    },
    protocolTypes: async(_: any, {}) => {
      return await db.select("*").from("protocolTypes");
    },
    protocolParameters: async(_: any, {}) => {
      return await db.select("*").from("protocolParameters");
    },
    users: async(_: any, {}) => {
      return await db.select("*").from("users");
    },
    user: async(_: any, { userId }: { userId: string }) => {
      return await db.select("*").from("users").where({ id: userId }).first();
    },
    me: async(_: any, args: any, context: any) => {
      const { token } = context;
      const cleanToken = token.replaceAll("\"", "").trim();
      const user: any = verifyToken(cleanToken);
      return await db.select("*").from("users").where({ id: user.id }).first();
    }
  },
  Device: {
    protocol: async(parent: any, {}) => {
      return await db('protocols').where({ id: parent.protocolId }).first();
    }
  },
  Protocol: {
    protocol_type: async(parent: any, {}) => {
      return await db('protocolTypes').where({ id: parent.protocolTypeId }).first();
    }
  },
  ProtocolParameter: {
    protocol: async(parent: any, {}) => {
      return await db('protocols').where({ id: parent.protocolId }).first();
    }
  }
}

