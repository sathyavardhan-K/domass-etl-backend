require('dotenv').config({ path: './.env' }); // ✅ Loads environment variables

const express = require("express");
const cors = require("cors");
const dataflowRoutes = require("./routes/dataflows");

const app = express();

app.use(cors());            // ✅ Enables Cross-Origin Resource Sharing
app.use(express.json());    // ✅ Parses incoming JSON requests

// ✅ Mount dataflows routes under /api/dataflows
app.use("/api/dataflows", dataflowRoutes);

// ✅ Use environment variable for port, fallback to 8080
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Dataflows running at http://localhost:${PORT}`);
});
