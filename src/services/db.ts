import knex, { Knex } from 'knex';
import "reflect-metadata";
import { autoInjectable } from 'tsyringe';
import db from '../database/dataBaseConnect';

interface Protocol {
  id: string,
  name: string
}

@autoInjectable()
export default class DatabaseService {
  private db: Knex<any, unknown[]> = undefined;
  constructor() {
    this.db = db;
  }

  async getDevices() {
    return await this.db.select('*').from('devices');
  }

  /*async getUsers() {
    return await this.db.select('*').from('users');
  }*/

  async checkUser(email: string) {
    return await this.db.select('*').from('users').where({email}).first();
  }

  async getProtocols() {
    return await this.db.select('*').from('protocols');
  }

  async getProtocolsByName(name: string) : Promise<Protocol> {
    return await this.db.select('*').from('protocolTypes').where({ name }).first();
  }

  async getProtocolParameters() {
    return await this.db.select('*').from('protocolParameters');
  }

  async getProtoclTypes() {
    return await this.db.select('*').from('protoclTypes');
  }

  async initStartData(protocolType: Protocol): Promise<any[]> {

    return await this.db.select([
        'devices.id', 
        'devices.ip',
        'devices.modAddress',
        'protocols.id',
        'protocolParameters.id',
        'protocolParameters.address',
        'protocolParameters.read_func',
        'protocolParameters.write_func',
        'protocolParameters.data_type',
        'protocolParameters.coef',
        'protocolParameters.byte_order',
        'protocolParameters.group',
        'protocolParameters.alias'
    ])
        .from('protocolTypes')
      .leftJoin('protocols', 'protocolTypes.id', '=', 'protocols.protocolTypeId')
      .leftJoin('devices', 'protocols.id', '=', 'devices.protocolId')
      .leftJoin('protocolParameters', 'protocols.id', '=', 'protocolParameters.protocolId')
      .whereRaw( `"protocolTypes"."id" = uuid('${protocolType.id}')` )

  }

}
