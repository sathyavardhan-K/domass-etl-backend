const express = require("express");
const router = express.Router();
const { snowflakeConnection } = require("./connection");

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

module.exports = router;
