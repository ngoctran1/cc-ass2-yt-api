const axios = require('axios');
const sql = require('./sql');

const API_KEY=process.env.YT_API_KEY;

const trendingURL = 'https://www.googleapis.com/youtube/v3/videos?part=status%2C%20snippet&chart=mostPopular&maxResults=5&regionCode=';
const regionURL = 'https://www.googleapis.com/youtube/v3/i18nRegions?part=snippet&key=';
const vidStatURL = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&id=';

const regionCodes = new Map();
const videos = new Set();

async function queryYoutube(URL) {        
    const result = await axios.get(URL)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error);
            return [];
        })
    return result;
}

module.exports = {
    getTrending: async function(regions) {
        let result = new Map();

        for(let code of regionCodes) {
            let cid = code[0];
            queryResult = await queryYoutube(trendingURL + cid + "&key=" + API_KEY);

            let regionVideos = [];
            for(let i in queryResult.items) {
                regionVideos.push({
                    vid: queryResult.items[i].id,
                    name: queryResult.items[i].snippet.title
                });
                videos.add(queryResult.items[i].id);
            }

            result.set(cid, regionVideos);
        }

        console.log(result);
        await sql.saveTrending(result);
        this.updateVideoStat();
    },
    getRegions: async function() {
        result = await queryYoutube(regionURL + API_KEY);
        for(let i in result.items) {
            regionCodes.set(result.items[i].snippet.gl, result.items[i].snippet.name);
        }
        console.log(regionCodes.size);
        sql.saveRegions(regionCodes);
    },
    updateVideoStat: async function() {
        console.log("Update Video Stat");
        for(let vid of videos) {
            console.log("VId = " + vid);
            let result = await queryYoutube(vidStatURL + vid + "&key=" + API_KEY);
            console.log(result);
        }
    }
}
