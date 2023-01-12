import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('protocolParameters',
  (table: Knex.TableBuilder) => {
    table.uuid('id').primary().notNullable().unique();
    table.uuid('protocolId').references('id').inTable('protocols');
    table.string('alias').notNullable();
    table.integer('address').notNullable();
    table.integer('read_func').notNullable();
    table.integer('write_func').notNullable();
    table.string('data_type').notNullable();
    table.float('coef').notNullable().defaultTo(0);
    table.integer('byte_order').notNullable().defaultTo(0);
    table.string('group').notNullable();
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropSchemaIfExists('protocolParameters');
}

