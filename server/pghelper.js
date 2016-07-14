"use strict";

let pg = require('pg'),
    databaseURL = process.env.DATABASE_URL || 'postgresql://ccoenraets@localhost/pushserver';

exports.query = function (sql, values, singleItem, log) {

    if (log) {
        console.log(sql, values);
    }

    return new Promise((resolve, reject) => {

        pg.connect(databaseURL, function (err, conn, done) {
            if (err) return reject(err);
            try {
                conn.query(sql, values, function (err, result) {
                    done();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(singleItem ? result.rows[0] : result.rows);
                    }
                });
            }
            catch (e) {
                done();
                reject(e);
            }
        });

    });

};

exports.update = function(sql, values, log) {

    if (log) {
        console.log(sql);
        console.log(values);
        console.log('databaseURL: ' + databaseURL);
    }

    return new Promise((resolve, reject) => {

        pg.connect(databaseURL, function (err, conn, done) {
            if (err) return deferred.reject(err);
            try {
                conn.query(sql, values, function (err, result) {
                    done();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.rowCount);
                    }
                });
            }
            catch (e) {
                done();
                reject(e);
            }
        });

    });

};
