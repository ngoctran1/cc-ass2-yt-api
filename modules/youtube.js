const axios = require('axios');
const sql = require('./sql');

const API_KEY=process.env.YT_API_KEY;

const trendingURL = 'https://www.googleapis.com/youtube/v3/videos?part=status%2C%20snippet&chart=mostPopular&maxResults=5&regionCode=';
const regionURL = 'https://www.googleapis.com/youtube/v3/i18nRegions?part=snippet&key=';

const regionCodes = new Map();

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
        let result = [];
        for(let code of regionCodes) {
            queryResult = await queryYoutube(trendingURL + code.gl + "&key=" + API_KEY);
            for(let i in queryResult.items) {
                if(queryResult.items[i].snippet.thumbnails.maxres) {
                    result.push(queryResult.items[i].snippet.thumbnails.maxres.url);
                } else {
                    result.push(queryResult.items[i].snippet.thumbnails.default.url);
                }
            }
        }
        output = "";
        for(let i in result) {
            output += "<img width=\"200\" src='" + result[i] + "' />";
            console.log(output);
        }
        return output;
    },
    getRegions: async function() {
        result = await queryYoutube(regionURL + API_KEY);
        for(let i in result.items) {
            regionCodes.set(result.items[i].snippet.gl, result.items[i].snippet.name);
        }
        console.log(regionCodes.size);
        sql.saveRegions(regionCodes);
    }
}