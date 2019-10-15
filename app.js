const env = require('dotenv');
env.config();

const express = require('express');
const app = express();
const routes = require('./routes/route');

// Start the server
const PORT = process.env.PORT || 8080;

// Forward everything to routes
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;