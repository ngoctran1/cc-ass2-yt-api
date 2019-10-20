const env = require('dotenv');
env.config();

const express = require('express');
const app = express();
const routes = require('./routes/route');
const youtube = require('./modules/youtube');
const sql = require('./modules/sql');

const DAY_HOURS = 24;
const HOUR_TO_MSEC = 60 * 60 * 1000;

async function updateData() {
  await youtube.getRegions();
  await youtube.getTrending();
  await youtube.updateVideoStat();
}

async function initialise() {
  let regions = await sql.getRegions();

  if(regions.length == 0) {
    console.log("No regions detected, initialising...");
    updateData();
  } else {
    console.log("Detected existing data.")
  }
}

async function initialiseSQL() {
  await sql.initialiseTables();
  await initialise();
}

initialiseSQL();
setInterval(updateData, DAY_HOURS * HOUR_TO_MSEC);

// Start the server
const PORT = process.env.PORT || 8080;

// Forward everything to routes
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;