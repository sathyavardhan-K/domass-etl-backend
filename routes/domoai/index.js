import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const apiKey = process.env.DOMO_DEVELOPER_TOKEN;
const apiUrl = process.env.API_URL;

router.post("/generate-query", async (req, res) => {
  const { inputJson } = req.body;

  const systemInstruction = `You are a Dataware house expert who design etl in domo and in Snowflake using  SQL .

You will be provided with:
1. JSON exported from Domo  Magic ETL
2. The schema of the source input dataset (including column names and types)

Your task is to analyze the ETL JSON and generate complete sql stired procedure and required ddl scripts for source and destination tables , production-ready for Snowflake ETL implementation.

Requirements:

- Parse the ETL steps to identify:
  - The source table
  - All transformations (filters, joins, aggregations, etc.)
  - The best sequence of executing the ETL transformation steps
  - The output (target) table

- Use the provided input schema to generate a CREATE TABLE statement for the source table.

- Infer the output schema based on the transformations. Carry over unchanged columns.

- Generate a CREATE OR REPLACE TABLE <output_name> statement for the output in Snowflake.

- Before creating any database, schema, or warehouse, check if it already exists. Use conditional statements or Snowflake metadata queries to avoid errors on re-creation.

- Set the context to use the correct database, schema, and warehouse. Prefer specifying these in the connection or use safe USE statements only after confirming existence.

- Build a Store procedure with the SQL transformation query reflecting the ETL logic using SELECT, WHERE, JOIN, GROUP BY, etc make sure to use proper CTE mechanism or temp table mechanism to sequence the transformation order.

  -  Write the Snowflake STORED PROCEDURE to load data in to the destinatoin table by using select into or merge statement .
  Include:
  - BEGIN ... END; block
  - Make sure to list the columns in all the select statements instead of using *
  - make sure to use varibles and temp tables only when needed and write drop statements for temp tables when used.
  - Make sure to use proper snowflake sintax for "select into" ," group by", "having" , "where" clauses etc
  - Proper error handling using RETURN messages only (no EXCEPTION or ERROR_MESSAGE blocks)
  - At least one RETURN '<message>'; before the final END;
  - Close the procedure with $$;

- Ensure every SQL statement ends with a semicolon (;), including the last one before END.

- Use the output update method from the ETL JSON:
  - If update method is REPLACE: use TRUNCATE followed by INSERT.
  - If update method is UPSERT or MERGE: use MERGE with deduplication logic as needed.

- Before creating a Snowflake TASK to schedule the procedure execution:
  - Check if the task already exists.
  - If it exists, drop or alter it safely to avoid conflicts.
  - Schedule the task based on the ETL's schedule (convert the cron expression accordingly).

- Default to using the STAGING schema in ANALYTICS_DB unless otherwise specified.

- Add clear section headings with comments in the SQL, such as:
  -- if not exists CREATE OR REPLACE DATABASE, SCHEMA, WAREHOUSE (MUST) else use the existing table  -DONT MENTION (IF NOT EXISTS)-
  -- USE QUERY EACH DATABASE AND SCHEMA AND WAREHOUSE (MUST)
  -- CREATE TABLE (INPUT SOURCE AND OUTPUT TARGET) (MUST)
  -- STORED PROCEDURE (TRANSFORMATION LOGIC) (MUST)
  -- TASK SCHEDULING (MUST)

- Output must strictly follow the below JSON format:

{
  "executions": {
    "1": "CREATE TABLE IF NOT EXISTS ANALYTICS_DB.STAGING.SOURCE_TABLE_NAME (COLUMN1 TYPE1, COLUMN2 TYPE2, ...);",
    "2": "CREATE OR REPLACE TABLE ANALYTICS_DB.STAGING.OUTPUT_TABLE_NAME (OUTPUT_COLUMN1 TYPE1, OUTPUT_COLUMN2 TYPE2, ...);",
    "3": "CREATE OR REPLACE PROCEDURE ANALYTICS_DB.STAGING.PROC_ETL_NAME() RETURNS STRING LANGUAGE SQL AS $$ BEGIN TRUNCATE TABLE ANALYTICS_DB.STAGING.OUTPUT_TABLE_NAME; INSERT INTO ANALYTICS_DB.STAGING.OUTPUT_TABLE_NAME (OUTPUT_COLUMN1, OUTPUT_COLUMN2, ...) WITH CTE1 AS (SELECT COLUMN1, COLUMN2 FROM ANALYTICS_DB.STAGING.SOURCE_TABLE_NAME WHERE <filter_conditions>), CTE2 AS (SELECT ... FROM CTE1 JOIN ... ON ...) SELECT OUTPUT_COLUMN1, OUTPUT_COLUMN2 FROM CTE2; RETURN 'ETL process completed successfully'; END; $$;",
    "4": "CREATE OR REPLACE TASK ANALYTICS_DB.STAGING.TASK_ETL_NAME WAREHOUSE = WAREHOUSE_NAME SCHEDULE = 'USING CRON <converted_cron_expression> UTC' AS CALL ANALYTICS_DB.STAGING.PROC_ETL_NAME();"
    .........
  }
}


- Each value should contain a complete SQL statement ending with a semicolon (;)
- Ensure the SQL is idempotent and safe to run multiple times without causing errors.

Purpose of this Generating Query-
 - after genreated this query im going to execute the query on snowflake via there package ,im loop each statment separate to execute.

Important:
- very important dont need any comments on STATEMENTS,
- Must Need to have create replace statment for each object to avoid error - avoid if exist
- Snowflake does not support EXCEPTION blocks or WHEN ERROR THEN in SQL stored procedures.
- Don't mix or reverse the order — Snowflake is strict about clause placement.
- Remove all unwanted text. Return only the JSON response as shown above, no extra explanation.`;

  if (!inputJson) {
    return res
      .status(400)
      .json({ error: "Missing systemInstruction or inputJson" });
  }

  const payload = {
    model: "domo.openai.gpt-4o-mini",
    input:
      systemInstruction + "DOMO's MAGIC ETL JSON :" + JSON.stringify(inputJson),
    parameters: {
      temperature: 0.2,
    },
  };

  const headers = {
    "Content-Type": "application/json",
    "X-DOMO-Developer-Token": apiKey,
  };

  try {
    const response = await axios.post(apiUrl, payload, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error from DOMO API:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
