const express = require("express");
const cors = require("cors");
const mysql2 = require("mysql2");
const mysql = require("mysql");

const app = express();
app.use(cors());
app.use(express.json());

// Database connectivity
const db = mysql2.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'csma'
});

db.connect((err) => {
  if (err) {
    console.error("err", err);
    return;
  }
  console.log('connected');
});

// Admin
app.post('/admin', (req, res) => {
  const { username, email, password, password2 } = req.body;
  const sqlSelect = "SELECT COUNT(*) AS count, username FROM principal WHERE username = ?";
  const sqlDelete = "DELETE FROM principal";
  const sqlInsert = "INSERT INTO principal (`username`, `email`, `password`) VALUES (?, ?, ?)";
  const values = [username, email, password, password2];
  const pass1 = password.toString();
  const pass2 = password2.toString();
  let existingUsername = '';

  // create table if it doesn't exist
  const createTable = 'CREATE TABLE IF NOT EXISTS principal (id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL);';

  db.query(createTable, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      return res.status(500).json({ message: 'Error creating table' });
    }
    console.log('Table "principal" created or already exists');

    // check if the user already exists
    db.query(sqlSelect, [username], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error checking user existence' });
      }
      const count = result[0].count;
      existingUsername = result[0].username;

      if (count > 0 && existingUsername !== username) {
        // User already exists with a different username
        res.status(200).json({ confirmationRequired: true });
      } else if (count > 0 && existingUsername === username) {
        // User already exists with the same username
        
          res.status(409).json({ message: 'User already exists' });
        
      } else {
        // User doesn't exist, delete the old user and insert the new user
        db.query(sqlDelete, (err, data) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error removing existing user' });
          }
          insertNewUser();
        });
      }
    });
  });

  // Function to insert the new user
  function insertNewUser() {
    if (pass1 === pass2) {
      db.query(sqlInsert, values, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error saving data to the database' });
        }
        console.log("Registration successful");
        return res.status(200).json({ message: 'Registration successful' });
      });
    } else {
      return res.status(408).json({ message: 'Passwords must be the same' });
    }
  }
});

app.post('/principal', (req, res) => {
  const { username, password } = req.body;
  const sqlSelect = "SELECT * FROM principal WHERE username = ?";

  // Check if the user exists in the database
  db.query(sqlSelect, [username], (err, result) => {
    if (err) {
      console.error("Error checking user existence:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    if (result.length === 0) {
      // User doesn't exist in the database
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result[0];
    const storedPassword = user.password;

    if (storedPassword === password) {
      // Passwords match, login successful
      return res.status(200).json({ success: true, message: "Login successful", user: { username: user.username, email: user.email, profilePictureURL: user.profilePictureURL } });
    } else {
      // Passwords don't match
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });
});

app.post('/principaldash', (req, res) => {
  const sqlSelect = "SELECT * FROM principal";
  const user = result[0];
  return res.status(200).json({ success: true, message: "Login successful", user: { username: user.username, email: user.email, profilePictureURL: user.profilePictureURL } });

})

app.post('/hod', (req, res) => {


})
app.post('/tutor', (req, res) => {


})
app.post('/staffs', (req, res) => {


})
app.post('/students', (req, res) => {


})

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
