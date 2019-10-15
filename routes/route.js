const express = require('express');
const youtube = require('../youtube');
const AsyncRouter = require("express-async-router").AsyncRouter;
const router = AsyncRouter();

router.get('/countryIDs', function (req, res) {
    return youtube.getRegions();
});

router.get('/trending', function (req, res) {
    return youtube.getTrending();
});

router.get('/sqlTest', function (req, res) {
    return youtube.testConnect();
});

router.get('/history', (req, res) => {
res
    .status(200)
    .send('History in progress.')
    .end();
});

router.get('/', (req, res) => {
res
    .status(200)
    .send('Nothing here yet...')
    .end();
});

module.exports = router;
