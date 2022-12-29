import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries

    await knex("protocolParameters").del();
    await knex("devices").del();
    await knex("protocols").del();
    await knex("protocolTypes").del();

    

    // Inserts seed entries
    await knex("protocolTypes").insert([
        { id: '3a16d9d6-6fb1-4892-b43f-9c734dd09d34', name: "modbus-tcp" },
        { id: '9c3ab29c-b330-4faf-b587-e753e2c1ed23', name: "mqtt" },
        { id: '6fab8cec-6eb8-4364-823b-f08b4dae906e', name: "opc-ua" },
        { id: 'e5660f8f-fd04-4b68-9b4b-ea74a326bfdb', name: "grpc" }
    ]);

    await knex("protocols").insert([
        { id: 'ebf6a8ac-1dbe-4947-b5ec-554f73996b0e', description: 'irz',
          production: 'irz', protocolTypeId: '3a16d9d6-6fb1-4892-b43f-9c734dd09d34' },
        { id: 'a3c37466-b3aa-461e-ac8e-f7ab8827ab9d', description: 'irz-mqtt',
          production: 'irz', protocolTypeId: '9c3ab29c-b330-4faf-b587-e753e2c1ed23' },
        { id: '59de44f2-b823-45d8-b2c6-cd785a250db2', description: 'region3',
          production: 'agency', protocolTypeId: '6fab8cec-6eb8-4364-823b-f08b4dae906e' }
    ]);

    await knex("devices").insert([
        { id: '023449fd-42a7-46ee-a875-7d34724dd62e', name: "kust2-1", production: 'irz',
          protocolId: 'ebf6a8ac-1dbe-4947-b5ec-554f73996b0e', ip: '170.40.15.22', modAddress: 240 },
        { id: 'd5c2636f-3435-45fd-98cf-c1d27d8d08e3', name: "kust2-3", production: 'electon',
          protocolId: '59de44f2-b823-45d8-b2c6-cd785a250db2', ip: '170.22.6.150', modAddress: 50 },
        { id: '3a4798fa-c13c-40bc-b701-5ad052941d6b', name: "kust7-1", production: 'irz',
          protocolId: 'a3c37466-b3aa-461e-ac8e-f7ab8827ab9d', ip: '100.120.0.11', modAddress: 58 }
    ]);

    await knex("protocolParameters").insert([
        { id: '2460f398-8da2-46bd-afc5-313ba8b6ff0f', protocolId: "ebf6a8ac-1dbe-4947-b5ec-554f73996b0e",
          alias: 'ia', address: 250, read_func: 4, write_func: 0, data_type: 'uint16', coef: 0, byte_order: 0 },
        { id: '37aeec0d-0441-473e-a113-4c914205deaf', protocolId: "ebf6a8ac-1dbe-4947-b5ec-554f73996b0e",
          alias: 'ib', address: 251, read_func: 4, write_func: 0, data_type: 'uint16', coef: 0, byte_order: 0 },
        { id: '1c82b87d-bd63-4654-ae7f-cfa9782f797b', protocolId: "a3c37466-b3aa-461e-ac8e-f7ab8827ab9d",
          alias: 'ua', address: 258, read_func: 4, write_func: 0, data_type: 'uint16', coef: 0, byte_order: 0 }
    ]);
};
