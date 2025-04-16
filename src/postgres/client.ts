"use server";
import { Client } from "pg";

const client = new Client({
  user: "username",
  host: "localhost",
  database: "database",
  password: "password",
  port: 5432,
});

export const testConnection = async (): Promise<any> => {
  await client.connect();

  // Test the connection
  const result = await client.query("SELECT NOW()");
  // should convert them into simple component.

  await client.end();

  return result;
};
