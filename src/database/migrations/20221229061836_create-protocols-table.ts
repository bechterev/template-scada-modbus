import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('protocols',
  (table: Knex.TableBuilder) => {
    table.uuid('id').primary().notNullable().unique();
    table.string('description').notNullable();
    table.string('production');
    table.uuid('protocolTypeId').references('id').inTable('protocolTypes');
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('protocols');
}
