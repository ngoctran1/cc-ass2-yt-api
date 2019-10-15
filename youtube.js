const axios = require('axios');

var mysql = require('mysql');

var pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    
    // If connecting via unix domain socket, specify the path
    // socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`

    // If connecting via TCP, enter the IP and port instead
    host: process.env.DB_HOST,
    port: 3306,
    connectionLimit : 10
});

const API_KEY=process.env.YT_API_KEY;

const trendingURL = 'https://www.googleapis.com/youtube/v3/videos?part=status%2C%20snippet&chart=mostPopular&maxResults=5&regionCode=';
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
    },
    testConnect: async function() {
        await pool.query(
        `CREATE TABLE IF NOT EXISTS countryID
            ( cid CHAR(2), name CHAR(100), PRIMARY KEY (cid) );`, function(err, response) {
                if(err) {
                    throw err;
                } else {
                    console.log(response);
                }
            });

        // await pool.query(
        //     `INSERT INTO countryID (cid, name) VALUES ("VN", "Vietnam");`, function(err, response) {
        //         if(err) {
        //             throw err;
        //         } else {
        //             console.log(response);
        //         }
        //     }
        // );
        
        await pool.query(`SELECT * FROM countryID;`, function(err, response) {
            if(err) {
                throw err;
            } else {
                console.log(response);
            }
        });

        // Terminate all connections
        // pool.end(function (err) {
        //     if (err) {
        //         console.log("Failed to close connections");
        //         throw err;
        //     } else {
        //         console.log("Successfully closed connections");
        //     }
        // });

        return "Done";
    }
}
