const env = require('dotenv');
env.config();

const express = require('express');
const app = express();
const routes = require('./routes/route');
const youtube = require('./modules/youtube');

const DAY_HOURS = 24;
const HOUR_TO_MSEC = 60 * 60 * 1000;

setInterval(youtube.getRegions, DAY_HOURS * HOUR_TO_MSEC);

// Start the server
const PORT = process.env.PORT || 8080;

// Forward everything to routes
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;