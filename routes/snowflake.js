// const express = require("express");
// const multer = require("multer");
// const axios = require("axios");
// const FormData = require("form-data");
// const fs = require("fs");

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// router.post("/generate-sql", upload.single("file"), async (req, res) => {
//   console.log("Hit /generate-sql");

//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   try {
//     const form = new FormData();
//     form.append("file", fs.createReadStream(req.file.path), {
//       filename: req.file.originalname,
//       contentType: req.file.mimetype,
//     });

//     const response = await axios.post(
//       "https://jsonsnowflakev2-457073865923.asia-south2.run.app/generate-sql",
//       form,
//       {
//         headers: form.getHeaders(),
//       }
//     );

//     fs.unlinkSync(req.file.path);
//     res.json(response.data);
//   } catch (error) {
//     fs.unlinkSync(req.file.path);
//     res.status(error.response?.status || 500).json({
//       error: "Failed to forward file",
//       message: error.message,
//       details: error.response?.data,
//     });
//   }
// });

// module.exports = router;
