require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const dataflowRoutes = require("./routes/dataflows");
const snowflakeRoutes = require("./routes/snowflake");

const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());

app.use("/api/dataflows", dataflowRoutes);

app.use("/api/snowflake", snowflakeRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Dataflows running at http://localhost:${PORT}`);
});
