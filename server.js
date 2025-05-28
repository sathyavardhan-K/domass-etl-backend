// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import dataflowRoutes from "./routes/dataflows.js";
import snowflakeRoutes from "./routes/snowflake/index.js";
import domoAiRoutes from "./routes/domoai/index.js";

dotenv.config({ path: "./.env" });

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/dataflows", dataflowRoutes);
app.use("/api/snowflake", snowflakeRoutes);
app.use("/api/domoai", domoAiRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
