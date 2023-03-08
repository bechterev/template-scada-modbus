import { rule, shield, and, or } from 'graphql-shield';
import { sign, verify } from 'jsonwebtoken';
import { compare } from 'bcrypt';

enum Roles {
  Ghost = 0,
  User = 1,
  Admin = 3,
}

export interface User {
  id: string,
  name: string,
  email: string,
  password: string,
  role: number,
  token?: string
}

const isGhost = rule()(async (parent, args, ctx) => {
  const { token } = ctx;
  const cleanToken = token.replaceAll("\"", "").trim();

  const user: any = verifyToken(cleanToken);

  return !user || user.role === Roles.Ghost;
});


const isAdmin = rule()(async (parent, args, ctx) => {
  const { token } = ctx;
  const cleanToken = token.replaceAll("\"", "").trim();

  const user: any = verifyToken(cleanToken);

  return user.role === Roles.Admin;
});

const isAuthorized = rule()(async (parent, args, ctx, info) => { 
  
  if (!ctx) {
    return false;
  }
  const { token } = ctx;
  const cleanToken = token.replaceAll("\"", "").trim();
  const user = verifyToken(cleanToken);

  return !!user;
});

export const permissions = shield({
  Query: {
    devices: isAuthorized,
    protocols: and(isAuthorized, isAdmin),
    me: and(isAuthorized, or(isAdmin,isGhost))
  },
  Mutation: {
    createDevice: isAuthorized,
    createProtocolType: isAuthorized,
    createProtocol: isAuthorized,
    createProtocolParameter: isAuthorized,
  }
});

const secretKey = process.env.JWT_SECRET;

export const generateToken = (user: { id: string, email: string, role: number }) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const options = {
    expiresIn: '1d',
  };
  return sign(payload, secretKey, options);
};

// Function to verify a JWT token
export const verifyToken = (token: string) => {
  try {
    const decoded = verify(token, secretKey);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};



export const verifyPassword = async (password: string, hash: string) => {
  return compare(password, hash);
};