const youtube = require('../modules/youtube');
const sql = require('../modules/sql');
const AsyncRouter = require("express-async-router").AsyncRouter;
const router = AsyncRouter();

router.get('/countryIDs', async function (req, res) {
    res.json(await sql.getRegions());
});

router.get('/trending', function (req, res) {
    return youtube.getTrending();
});

router.get('/history', (req, res) => {
res
    .status(200)
    .send('History in progress.')
    .end();
});

module.exports = router;