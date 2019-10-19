const axios = require('axios');
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,

    // Uncomment the following when deploying to Google Cloud
    socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,

    // Uncomment the following when testing locally using Google Cloud SQL Proxy
    // host: 'localhost',
    // port: 3306,

    connectionLimit : 10
});
const API_KEY=process.env.API_KEY;

// Reference: https://stackoverflow.com/questions/7744912/making-a-javascript-string-sql-friendly/32648526
// Used to ensure safe string values when inserting into SQL database
function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}

async function getRegionLocation(cid) {
    let geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?key=${API_KEY}&components=country:${cid}`;        
    const result = await axios.get(geocodeURL)
        .then(response => {
            if(response.data.results[0]) { 
                return response.data.results[0].geometry.location;
            } else {
                return null;
            }
        })
        .catch(error => {
            console.log(error);
            return null;
        })
    return result;
}

function getDate() {
    let date = new Date();
    // getUTCMonth returns a zero indexed month number
    return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
}

module.exports = {
    setupTables: async function() {
        await pool.query(`CREATE TABLE IF NOT EXISTS countryID(cid CHAR(2), name CHAR(255), longitude DOUBLE, latitude DOUBLE, PRIMARY KEY (cid));`, function(err, response) {
            if(err) {
                throw err;
            } else {
                console.log("Creating countryID table success");
            }
        });

        await pool.query(`CREATE TABLE IF NOT EXISTS videoID(vid CHAR(100), name CHAR(255), PRIMARY KEY (vid));`, function(err, response) {
            if(err) {
                console.log("Creating vid table failed");
                throw err;
            } else {
                console.log("Creating vid table success");
            }
        });

        return;
    },
    setupVideoDB: async function() {
        await pool.query(`CREATE TABLE IF NOT EXISTS regionTrending(cid CHAR(2), vid CHAR(100), date DATETIME, PRIMARY KEY (cid, vid), FOREIGN KEY(cid) 
        REFERENCES countryID(cid), FOREIGN KEY(vid) REFERENCES videoID(vid));`, function(err, response) {
            if(err) {
                console.log("Creating regionTrending table failed");
                throw err;
            } else {
                console.log("Creating regionTrending table success");
            }
        });

        await pool.query(`CREATE TABLE IF NOT EXISTS videoStat(vid CHAR(100), date DATETIME, views BIGINT, PRIMARY KEY (vid, date), FOREIGN KEY(vid) 
        REFERENCES videoID(vid));`, function(err, response) {
            if(err) {
                console.log("Creating videoStat table failed");
                throw err;
            } else {
                console.log("Creating videoStat table success");
            }
        });
        return;
    },
    getRegions: async function() {
        let response = await pool.query(`SELECT * from countryID;`);
        return response[0];
    },
    saveRegions: async function(regionCodes) {
        for(let region of regionCodes) {
            let cid = region[0];
            let name = region[1];
            let geocode = await getRegionLocation(cid);
            if(geocode) {
                pool.query(`INSERT INTO countryID(cid, name, longitude, latitude) VALUES ("` + cid +`", "` + mysql_real_escape_string(name) + `", ` + geocode.lng + `, ` + geocode.lat + `) ON DUPLICATE KEY UPDATE name = "` + mysql_real_escape_string(name) + `", latitude = ` + geocode.lat + `, longitude = ` + geocode.lng + `;`, function(err, response) {
                    if(err) {
                        throw err;
                    } else {
                        console.log("Sucessfully added " + name + " (cid = " + cid + ") into CountryID");
                    }
                });
            } else {
                console.log("Unable to find country: " + name + " (cid = " + cid + ")");
            }
        }
    },
    saveTrending: async function(trendingVideos) {
        trendingVideos.forEach((videos, cid) => {
            for(let i in videos) {
                pool.query(`INSERT INTO videoID(vid, name) VALUES ("${videos[i].vid}", "${mysql_real_escape_string(videos[i].name)}") ON DUPLICATE KEY UPDATE name="` + mysql_real_escape_string(videos[i].name) + `";`, function(err, response) {
                    if(err) {
                        console.log("Inserting " + videos[i].vid + " into videoID failed");
                        throw err;
                    } else {
                        console.log("Inserting " + videos[i].vid + " into videoID succeeded");
                    }
                });

                pool.query(`INSERT IGNORE INTO regionTrending(cid, vid, date) VALUES ("${cid}", "${videos[i].vid}", "${getDate()}");`, function(err, response) {
                    if(err) {
                        console.log("Inserting (cid, vid) = (" + cid + ", " + videos[i].vid + ") into regionTrending failed");
                        throw err;
                    } else {
                        console.log("Inserting (cid, vid) = (" + cid + ", " + videos[i].vid + ") into regionTrending succeded");
                    }
                });
            }
        });
    },
    saveVideoStat: async function(videoStats) {
        videoStats.forEach((statistics, vid) => {
            console.log("Video: " + vid + ": " + statistics.viewCount);
            pool.query(`INSERT INTO videoStat(vid, date, views) VALUES ("${vid}", "${getDate()}", ${statistics.viewCount}) ON DUPLICATE KEY UPDATE views=${statistics.viewCount}` , function(err, response) {
                if(err) {
                    console.log("Updating " + vid + " views failed");
                    throw err;
                } else {
                    console.log("Updating " + vid + " views succeeded");
                }
            });
        });
    },
    getVideos: async function() {
        let response = await pool.query(`SELECT * from videoID;`);
        return response[0];
    },
    getVideoViews: async function(vid) {
        let response;
        if(vid) {
            response = await pool.query(`SELECT * from videoStat WHERE vid="${vid}";`);
        } else {
            response = [];
        }
        return response[0];
    },
    getCurrentTrending: async function(cid) {
        let response;
        if(cid) {
            response = await pool.query(`SELECT * from videoID NATURAL JOIN regionTrending WHERE cid="${cid}" ORDER BY date LIMIT 5;`);
        } else {
            response = await pool.query(`SELECT * from videoID NATURAL JOIN regionTrending ORDER BY date;`);
        }
        return response[0];
    },
    getAllTrending: async function(cid) {
        let response;
        if(cid) {
            response = await pool.query(`SELECT * from videoID NATURAL JOIN regionTrending WHERE cid="${cid}" ORDER BY date;`);
        } else {
            response = await pool.query(`SELECT * from videoID NATURAL JOIN regionTrending ORDER BY date;`);
        }
        return response[0];
    },
    sample: function() {
        return getDate();
    }
}