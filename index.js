const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cors());

const interface = require("./interface.js");

app.use("/api", router);

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Insert
router.post("/insert", (req, res) => {
  interface.insertFunc(req, res);
});

// Delete
router.post("/delete", (req, res) => {
  interface.deleteFunc(req, res);
});

// Update
router.post("/update", (req, res) => {
  interface.updateFunc(req, res);
});

// Select
router.post("/select", (req, res) => {
  interface.selectFunc(req, res);
});

// Test get
router.get("/testGet", (req, res) => {
  interface.testGet(req, res);
});

app.listen(3669, '192.168.0.0', (err) => {
  if (err) {
    console.log("server error, Please try again later!");
  } else {
    console.log("server stated.....");
  }
});
