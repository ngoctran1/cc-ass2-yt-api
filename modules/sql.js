const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,

    // Uncomment the following when deploying to Google Cloud
    // socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,

    // Uncomment the following when testing locally using Google Cloud SQL Proxy
    host: 'localhost',
    port: 3306,

    connectionLimit : 10
});

// Reference: https://stackoverflow.com/questions/7744912/making-a-javascript-string-sql-friendly/32648526
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

module.exports = {
    setupTables: async function() {
        pool.query(`CREATE TABLE IF NOT EXISTS countryID(cid CHAR(2), name CHAR(255), PRIMARY KEY (cid));`, function(err, response) {
            if(err) {
                throw err;
            } else {
                console.log("Creating countryID table success");
                // console.log(response);
            }
        });

        pool.query(`CREATE TABLE IF NOT EXISTS videoID(vid CHAR(100), name CHAR(255), PRIMARY KEY (vid));`, function(err, response) {
            if(err) {
                console.log("Creating vid table failed");
                throw err;
            } else {
                console.log("Creating vid table success");
                // console.log(response);
            }
        });

        return;
    },
    setupVideoDB: async function() {
        pool.query(`CREATE TABLE IF NOT EXISTS regionTrending(cid CHAR(2), vid CHAR(100), PRIMARY KEY (cid, vid), FOREIGN KEY(cid) 
        REFERENCES countryID(cid), FOREIGN KEY(vid) REFERENCES videoID(vid));`, function(err, response) {
            if(err) {
                console.log("Creating regionTrending table failed");
                throw err;
            } else {
                console.log("Creating regionTrending table success");
                // console.log(response);
            }
        });

        pool.query(`CREATE TABLE IF NOT EXISTS videoStat(vid CHAR(100), date DATETIME, views BIGINT, PRIMARY KEY (vid, date), FOREIGN KEY(vid) 
        REFERENCES videoID(vid));`, function(err, response) {
            if(err) {
                console.log("Creating videoStat table failed");
                throw err;
            } else {
                console.log("Creating videoStat table success");
                // console.log(response);
            }
        });
        return;
    },
    getRegions: async function() {
        let response = await pool.query(`SELECT * from countryID;`);
        return response[0];
    },
    saveRegions: async function(regionCodes) {
        regionCodes.forEach((name, cid) => {
            pool.query(`INSERT INTO countryID (cid, name) VALUES ("` + cid +`", "` + mysql_real_escape_string(name) + `") ON DUPLICATE KEY UPDATE name="` + mysql_real_escape_string(name) + `";`, function(err, response) {
                if(err) {
                    throw err;
                } else {
                    // console.log(response);
                }
            });
        });
    },
    saveTrending: async function(trendingVideos) {
        trendingVideos.forEach((videos, cid) => {
            for(let i in videos) {
                console.log("Trying: " + `INSERT INTO videoID(vid, name) VALUES ("` + videos[i].vid +`", "` + mysql_real_escape_string(videos[i].name) + `") ON DUPLICATE KEY UPDATE name="` + mysql_real_escape_string(videos[i].name) + `";`);
                pool.query(`INSERT INTO videoID(vid, name) VALUES ("` + videos[i].vid +`", "` + mysql_real_escape_string(videos[i].name) + `") ON DUPLICATE KEY UPDATE name="` + mysql_real_escape_string(videos[i].name) + `";`, function(err, response) {
                    if(err) {
                        console.log("Inserting into vid failed");
                        throw err;
                    } else {
                        console.log("Inserting into vid success");
                        // console.log(response);
                    }
                });
    
                console.log("Trying: " + `INSERT IGNORE INTO regionTrending(cid, vid) VALUES ("` + cid +`", "` + videos[i].vid + `");`);
                pool.query(`INSERT IGNORE INTO regionTrending(cid, vid) VALUES ("` + cid +`", "` + videos[i].vid + `");`, function(err, response) {
                    if(err) {
                        console.log("Inserting into regionTrending failed");
                        throw err;
                    } else {
                        console.log("Inserting into regionTrending success");
                        // console.log(response);
                    }
                });
            }
        });
    },
    getVideos: async function() {
        let response = await pool.query(`SELECT * from videoID;`);
        return response[0];
    },
    getTrending: async function() {
        let response = await pool.query(`SELECT * from regionTrending;`);
        return response[0];
    }
}