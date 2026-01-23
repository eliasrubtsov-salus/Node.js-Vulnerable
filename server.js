const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const xml2js = require('xml2js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vulnerability 1: Hardcoded credentials
const DB_CONFIG = {
  host: 'localhost',
  user: 'admin',
  password: 'Admin123!',
  database: 'testdb'
};

const JWT_SECRET = 'my-super-secret-key-123';

// Vulnerability 2: SQL Injection
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const connection = mysql.createConnection(DB_CONFIG);
  
  // SQL Injection vulnerability - direct string concatenation
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    if (results.length > 0) {
      const token = jwt.sign({ userId: results[0].id }, JWT_SECRET);
      res.json({ token, user: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
  
  connection.end();
});

// Vulnerability 3: Command Injection
app.post('/ping', (req, res) => {
  const { host } = req.body;
  
  // Command injection vulnerability
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ output: stdout });
  });
});

// Vulnerability 4: Path Traversal
app.get('/files/:filename', (req, res) => {
  const { filename } = req.params;
  
  // Path traversal vulnerability
  const filePath = path.join(__dirname, 'uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Vulnerability 5: XXE (XML External Entity)
app.post('/parse-xml', async (req, res) => {
  const { xml } = req.body;
  
  // XXE vulnerability - no protection against external entities
  const parser = new xml2js.Parser();
  
  parser.parseString(xml, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ parsed: result });
  });
});

// Vulnerability 6: Insecure deserialization & eval
app.post('/calculate', (req, res) => {
  const { expression } = req.body;
  
  try {
    // Arbitrary code execution via eval
    const result = eval(expression);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Vulnerability 7: SSRF (Server-Side Request Forgery)
app.post('/fetch-url', async (req, res) => {
  const { url } = req.body;
  
  try {
    // SSRF vulnerability - no URL validation
    const response = await axios.get(url);
    res.json({ data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vulnerability 8: Insecure JWT verification
app.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    // Using algorithm: 'none' vulnerability
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256', 'none'] });
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Vulnerability 9: NoSQL Injection
app.post('/search', (req, res) => {
  const { searchQuery } = req.body;
  
  // NoSQL injection if using MongoDB
  // This would be vulnerable: User.find({ username: searchQuery })
  res.json({ message: 'Search endpoint - vulnerable to NoSQL injection' });
});

// Vulnerability 10: Missing rate limiting & weak password hashing
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  // Weak bcrypt rounds (should be at least 10-12)
  const hashedPassword = await bcrypt.hash(password, 4);
  
  const connection = mysql.createConnection(DB_CONFIG);
  const query = `INSERT INTO users (username, password) VALUES ('${username}', '${hashedPassword}')`;
  
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ message: 'User registered successfully' });
  });
  
  connection.end();
});

// Vulnerability 11: Information disclosure
app.get('/error-test', (req, res) => {
  try {
    throw new Error('Database connection failed: mysql://admin:Admin123!@localhost:3306/testdb');
  } catch (error) {
    // Exposing full error details including sensitive info
    res.status(500).json({ 
      error: error.message, 
      stack: error.stack,
      config: DB_CONFIG 
    });
  }
});

// Vulnerability 12: Missing HTTPS & security headers
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Warning: This is a deliberately vulnerable application for testing purposes only!');
});

module.exports = app;
