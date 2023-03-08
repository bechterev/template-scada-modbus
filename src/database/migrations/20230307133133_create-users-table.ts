import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", 
  (table: Knex.TableBuilder) => {
    table.uuid("id").primary().notNullable().unique();
    table.string("name");
    table.string("email").unique().notNullable();
    table.integer("role").defaultTo(0);
    table.string("password").notNullable();
    table.string("token");
    table.timestamps(false, true);
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("users");
}


