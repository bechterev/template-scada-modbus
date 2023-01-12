import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('protocolTypes',
  (table: Knex.TableBuilder) => {
    table.uuid('id').primary().notNullable().unique();
    table.string('name').notNullable();
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('protocolTypes');
  //return knex.raw(`DROP TABLE IF EXISTS protocolTypes CASCADE`);
}


