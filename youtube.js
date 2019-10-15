const axios = require('axios');
const API_KEY='AIzaSyBayqL1DhIiVrBO7PrxgWYcnj4i0z7CZP0';

const trendingURL = 'https://www.googleapis.com/youtube/v3/videos?part=status%2C%20snippet&chart=mostPopular&maxResults=5&regionCode='
const regionURL = 'https://www.googleapis.com/youtube/v3/i18nRegions?part=snippet&key=';

const regionCodes = new Set();

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
            regionCodes.add(result.items[i].snippet);
        }
        console.log(regionCodes);
        return result;
    }
}
