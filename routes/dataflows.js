// ./routes/dataflows.js
import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const dataflowId = req.params.id;
  const xCookie = req.headers["x-cookie"];

  if (!xCookie) {
    return res.status(400).json({ error: "Missing x-cookie header" });
  }

  try {
    const domoResponse = await axios.get(
      `https://gwcteq-partner.domo.com/api/dataprocessing/v2/dataflows/${dataflowId}`,
      {
        headers: {
          Cookie: xCookie,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(domoResponse.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: "Domo API request failed",
      message: err.message,
      details: err.response?.data,
    });
  }
});

export default router;
