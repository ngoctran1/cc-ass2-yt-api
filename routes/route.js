const sql = require('../modules/sql');
const AsyncRouter = require("express-async-router").AsyncRouter;
const router = AsyncRouter();

router.get('/countryids', async function (req, res) {
    res.json(await sql.getRegions());
});

router.get('/toptrendingvideos', async function (req, res) {
    res.json(await sql.getCurrentTrending(req.query.cid));
});

router.get('/alltrendingvideos', async function (req, res) {
    res.json(await sql.getAllTrending(req.query.cid));
});

router.get('/videoviews', async function (req, res) {
    res.json(await sql.getVideoViews(req.query.vid));
});

router.get('/history', (req, res) => {
res
    .status(200)
    .send('History in progress.')
    .end();
});

module.exports = router;