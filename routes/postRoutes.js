const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Posts route works!");
});

module.exports = router;
