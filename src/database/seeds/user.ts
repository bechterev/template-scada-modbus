import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("users").del();

    await knex("users").insert([
        { id: '8960f398-4da2-46bd-afc5-313ba8b62458', name: 'Admin', email: 'supreme@fake.info', role: 3,
          password: '$2a$10$nYLuDyvZebhYVckfVR5vJOC24KBI0wPA9CJhDvpggCiiuneF46fOe' }
      ]);
};
