const express = require("express");
const mysql = require("mysql");
const PORT = 4100;
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
const app = express();
app.use(bodyParser.json());

app.get("/healthz", (req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  //checking if body is there or not
  const raw_body = Object.keys(req.body).lengt;
  if (req.body && raw_body > 0) {
    return res.status(400).end();
  }

  //checking query_params
  const url_check = Object.keys(req.query).length;
  if (url_check > 0) {
    return res.status(400).end();
  }
  if (req.headers["content-length"] > 0 || req.headers["transfer-encoding"]) {
    return res.status(400).end();
  }

  //checking connection
  db.ping((error) => {
    if (error) {
      return res.status(503).end();
    } else {
      return res.status(200).end();
    }
  });
});
//All others api call except get will give 405
app.all("/healthz", (req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  return res.status(405).end();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
