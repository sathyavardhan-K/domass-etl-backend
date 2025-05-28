import express from "express";
import { snowflakeConnection } from "./connection.js";

const router = express.Router();

// POST /execute route to process SQL scripts
router.post("/execute", async (req, res) => {
  const { sql, snowflakeConfig } = req.body;
  console.log("Received snowflakeConfig payload:", snowflakeConfig);

  if (!sql || !sql.executions || typeof sql.executions !== "object") {
    return res.status(400).json({
      error: "Invalid or missing 'executions' object in SQL payload.",
    });
  }

  try {
    const conn = await snowflakeConnection(snowflakeConfig);
    const statements = Object.values(sql.executions);
    const results = [];

    for (let stmt of statements) {
      console.log("\n🚀 Executing statement:\n", stmt, "\n");

      await new Promise((resolve, reject) => {
        conn.execute({
          sqlText: stmt,
          complete: (err, _stmt, rows) => {
            if (err) {
              console.error("❌ Execution failed for:\n", stmt);
              return reject(new Error(`Error in:\n${stmt}\n\n${err.message}`));
            }
            results.push({ statement: stmt, rows });
            resolve();
          },
        });
      });
    }

    return res.json({
      message: "✅ SQL script executed successfully.",
      results,
    });
  } catch (error) {
    console.error("❗ SQL Execution Error:", error);
    return res.status(500).json({
      error: error.message || "Unknown error occurred during SQL execution.",
    });
  }
});

router.post("/fetch-tables", async (req, res) => {
  let snowflakeConfig = req.body.snowflakeConfig;

  // If snowflakeConfig is a JSON string, parse it
  if (typeof snowflakeConfig === "string") {
    try {
      snowflakeConfig = JSON.parse(snowflakeConfig);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON string for snowflakeConfig." });
    }
  }

  if (
    !snowflakeConfig ||
    typeof snowflakeConfig !== "object" ||
    !snowflakeConfig.database ||
    !snowflakeConfig.schema
  ) {
    return res.status(400).json({
      error: "Missing required fields in snowflakeConfig: database or schema.",
    });
  }

  try {
    const conn = await snowflakeConnection(snowflakeConfig);

    const { database, schema } = snowflakeConfig;

    const sqlText = `
      SELECT TABLE_NAME
      FROM ${database}.INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = '${schema}'
      ORDER BY TABLE_NAME;
    `;

    conn.execute({
      sqlText,
      complete: (err, _stmt, rows) => {
        if (err) {
          console.error("❌ Failed to fetch table names:", err);
          return res.status(500).json({ error: err.message });
        }

        const tableNames = rows.map(row => row.TABLE_NAME);
        // console.log("tableNames", tableNames);
        
        return res.json({ tables: tableNames });
      },
    });
  } catch (error) {
    console.error("❗ Connection error:", error);
    return res.status(500).json({
      error: error.message || "Unexpected error while fetching tables.",
    });
  }
});

export default router;
