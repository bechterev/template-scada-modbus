import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Device {
    id: ID!
    name: String!
    production: String
    protocol: Protocol
    ip: String
    modAddress: Int
  }
  
  type Protocol {
    id: ID!
    description: String!
    production: String
    protocol_type: ProtocolType
  }  
  
  type ProtocolType {
    id: ID!
    name: String!
  }

  type ProtocolParameter {
    id: ID!
    protocol: Protocol!
    alias: String!
    address: Int!
    read_func: Int!
    write_func: Int!
    data_type: String!
    coef: Float!
    byte_order: Int!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    role: Int!
    token: String
  }
  
  type Query {
    devices: [Device]
    device(id: ID!): Device
    protocols: [Protocol]
    protocolTypes: [ProtocolType]
    protocolParameters: [ProtocolParameter]
    users: [User]
    user(userId: ID!): User
    me: User
  }
  
  type Mutation {
    createDevice(id: ID!, name: String!, production: String!, ip: String, modAddress: Int): Device
    createProtocolType(id: ID!, name: String!): ProtocolType
    createProtocol(id: ID!, description: String!, production: String!, protocol_type: String!): Protocol
    createProtocolParameter(id: ID!, protocol: String!, alias: String!, address: Int!,
      read_func: Int!, write_func: Int!, data_type: String!, coef: Float!, byte_order: Int!): ProtocolParameter
    login(email: String!, password: String!): User
  }`;
