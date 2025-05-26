import dotenv from "dotenv";
dotenv.config();
import snowflake from "snowflake-sdk";

export const snowflakeConnection = async (snowflakeConfig) => {
  const connection = snowflake.createConnection({
    account: snowflakeConfig?.account,
    username: snowflakeConfig?.username,
    password: snowflakeConfig?.password,
    database: snowflakeConfig?.database,
    schema: snowflakeConfig?.schema,
    warehouse: snowflakeConfig?.warehouse,
    role: snowflakeConfig?.role,
  });

  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) {
        console.error("Unable to connect: " + err.message);
        reject(err);
      } else {
        console.log("Successfully connected to Snowflake.");
        resolve(conn);
      }
    });
  });
};
