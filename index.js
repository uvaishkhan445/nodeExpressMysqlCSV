const express = require("express");
const mysql = require("mysql2");
const { Parser } = require("json2csv");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "developer",
  password: "password",
  database: "express",
});

// Connect to the database
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API endpoints
app.get("/users", (req, res) => {
  // Fetch all users from the database
  db.query("SELECT * FROM users", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/", (req, res) => {
  res.json({ message: "hello world" });
});

app.get("/about", (req, res) => {
  res.json({ message: "about us" });
});

// add user
app.post("/addUser", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const mobile = req.body.mobile;

  // Insert user into the database
  db.query(
    "INSERT INTO users (name, email,mobile) VALUES (?,?,?)",
    [name, email, mobile],
    (err, result) => {
      if (err) throw err;
      res.json({ message: "User added successfully" });
    }
  );
});

app.get("/download", (req, res) => {
  // Fetch all users from the database
  db.query("SELECT * FROM users", (err, results) => {
    if (err) throw err;

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(results);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');
    res.status(200).send(csv);
  });
});

app.get("/download2", (req, res) => {
  const csvWriter = createCsvWriter({
    path: "data.csv",
    header: [
      { id: "id", title: "ID" },
      { id: "name", title: "Name" },
      { id: "email", title: "Email" },
      { id: "mobile", title: "Mobile" },
    ],
  });
  db.query("SELECT * FROM users", (err, results) => {
    if (err) throw err;
    const data = results;

    csvWriter.writeRecords(data).then(() => {
      res.download("data.csv");
    });
  });
});

app.listen(port, function () {
  console.log(`Server start on port : ${port}`);
});
