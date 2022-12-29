import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('devices',
  (table: Knex.TableBuilder) => {
    table.uuid('id').primary().notNullable().unique();
    table.string('name').notNullable();
    table.string('production').notNullable();
    table.uuid('protocolId').references('id').inTable('protocols');
    table.string('ip');
    table.integer('modAddress');
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('devices');
}