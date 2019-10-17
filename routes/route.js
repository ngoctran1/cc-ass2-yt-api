const sql = require('../modules/sql');
const AsyncRouter = require("express-async-router").AsyncRouter;
const router = AsyncRouter();

router.get('/countryids', async function (req, res) {
    res.json(await sql.getRegions());
});

router.get('/trending', async function (req, res) {
    res.json(await sql.getTrending());
});

router.get('/videos', async function (req, res) {
    res.json(await sql.getVideos());
});

router.get('/history', (req, res) => {
res
    .status(200)
    .send('History in progress.')
    .end();
});

module.exports = router;