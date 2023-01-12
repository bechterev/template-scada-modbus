import Knex, { knex } from 'knex';
import config from './knexfile'

const configData = config['development'];
console.log(JSON.stringify(configData), process.env.POSTGRES_HOST);

const db = knex(configData);

export default db;