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

module.exports = {
    getRegions: async function() {
        let response = await pool.query(`SELECT * from countryID;`);
        return response[0];
    },
    saveRegions: async function(regionCodes) {
        await pool.query(`CREATE TABLE IF NOT EXISTS countryID(cid CHAR(2), name CHAR(100), PRIMARY KEY (cid));`, function(err, response) {
            if(err) {
                throw err;
            } else {
                console.log(response);
            }
        });

        regionCodes.forEach((name, cid) => {
            pool.query(`INSERT INTO countryID (cid, name) VALUES ("` + cid +`", "` + name + `") ON DUPLICATE KEY UPDATE name="` + name + `";`, function(err, response) {
                if(err) {
                    throw err;
                } else {
                    console.log(response);
                }
            });
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
    }
}