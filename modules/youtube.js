const axios = require('axios');
const sql = require('./sql');

const API_KEY=process.env.API_KEY;

const trendingURL = 'https://www.googleapis.com/youtube/v3/videos?part=status%2C%20snippet&chart=mostPopular&maxResults=5&regionCode=';
const regionURL = 'https://www.googleapis.com/youtube/v3/i18nRegions?part=snippet&key=';
const vidStatURL = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&id=';

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
        // Retrieve existing region codes
        let regionCodes = await sql.getRegions();

        let result = new Map();
        let newVideos = new Set();

        for(let i in regionCodes) {
            let cid = regionCodes[i].cid;
            queryResult = await queryYoutube(trendingURL + cid + "&key=" + API_KEY);

            let regionVideos = [];
            for(let i in queryResult.items) {
                regionVideos.push({
                    vid: queryResult.items[i].id,
                    name: queryResult.items[i].snippet.title
                });
                newVideos.add({vid: queryResult.items[i].id});
            }

            result.set(cid, regionVideos);
        }

        await sql.saveTrending(result);
    },
    getRegions: async function() {
        let regionCodes = new Map();
        result = await queryYoutube(regionURL + API_KEY);

        for(let i in result.items) {
            regionCodes.set(result.items[i].snippet.gl, result.items[i].snippet.name);
        }
        
        console.log("Received " + regionCodes.size + " regions from YouTube API");
        await sql.saveRegions(regionCodes);
    },
    updateVideoStat: async function(videos) {
        console.log("Update Video Stat");
        let result = new Map();

        // Update all videos if none is supplied
        if(!videos) {
            videos = await sql.getVideos();
        }
        
        for(let video of videos) {
            console.log("Updating video: " + video.vid);
            let queryResult = await queryYoutube(vidStatURL + video.vid + "&key=" + API_KEY);
            result.set(video.vid, queryResult.items[0].statistics);
        }

        await sql.saveVideoStat(result);
    }
}
