var db = require('./pghelper'),
    apn = require('apn'),
    service = new apn.connection({ passphrase: process.env.CERT_PASSPHRASE, production: true });


service.on('transmissionError', function(errCode, notification, device) {
    console.error("Notification caused error: " + errCode + " for device ", device, notification);
});

service.on('error', function(error) {
    console.error(JSON.stringify(error));
});

service.on('timeout', function () {
    console.log("Connection Timeout");
});

exports.pushNotification = function(req, res, next) {

    var message = req.body.message,
        userIds = req.body.userIds,
        note = new apn.notification(),
        tokens = [];

    /*
        The mobile SDK returns a 15 character userid. Convert UserIds provided by Salesforce org to 15 chars
        to be able to test equality.
     */
    for (var i=0; i<userIds.length; i++) {
        userIds[i] = userIds[i].substr(0,15);
    }

    note.setAlertText(message);
    note.contentAvailable = 1;
    note.sound = "ping.aiff";

    db.query("SELECT token FROM mapping WHERE user_id IN ($1)", [userIds.join()], false, true)
        .then(function(mappings) {
            for (var i=0; i<mappings.length; i++) {
                tokens.push(mappings[i].token);
            }
            if (tokens.length>0) {
                service.pushNotification(note, tokens);
            }
            res.send("ok");
        })
        .catch(next);
};

exports.register = function(req, res, next) {

    var token = req.body.token,
        userId = req.body.userId;

    db.query('SELECT user_id FROM mapping WHERE token=$1', [token], true)
        .then(function(mapping) {
            if(mapping) {
                if (userId !== mapping.user_id) {
                    db.update('UPDATE mapping SET user_id=$1 WHERE token=$2', [userId, token])
                        .then(function() {
                            res.send('ok');
                        })
                        .catch(next);
                } else {
                    console.log("already registered");
                    res.send('ok');
                }
            } else {
                db.update('INSERT INTO mapping (token, user_id) VALUES ($1, $2)', [token, userId])
                    .then(function(obj) {
                        res.send('ok');
                    })
                    .catch(next);
            }
        })
        .catch(next);
};

exports.find = function(req, res, next) {

    db.query('SELECT * FROM mapping')
        .then(function(mappings) {
            res.send(mappings);
        })
        .catch(next);
};