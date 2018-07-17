"use strict";

const express = require('express');
const app = express();
const childProcess = require("child_process");
const fs = require('fs');

var oldSpawn = childProcess.spawn;
childProcess.spawn = mySpawn;

function mySpawn() {
    console.log('spawn called');
    console.log(arguments);
    var result = oldSpawn.apply(this, arguments);
    return result;
}

app.working_dir = process.cwd()

app.set('view engine', 'ejs')
app.use('/static', express.static('public'))
app.use(express.bodyParser());


app.get('/', function (req, res) {
    res.render('home')
});

app.post('/subproc', function (req, res) {
    var data = req.body.data
    var alpha = req.body.alpha
    console.log(data.length)
    var crypto = require('crypto');
    var hex = crypto.createHash('md5').update(data).digest("hex") + (alpha.replace('.', '_'))
    var path = process.cwd() + '/data/' + hex + '.csv'
    console.log(path)

    fs.writeFile(path, data, function (err) {
        if (err) {
            res.send('oops' + path)
            return console.log(err);
        }

        console.log("The file was saved!");
        var swapArgs = ['kme.py', path, alpha]

        var prc = childProcess.spawn('python3', swapArgs, {
            cwd: app.working_dir + '/../py/'
        });

        prc.stdout.setEncoding('utf8');

        prc.stdout.on('data', function (data) {
            var str = data.toString();
            console.log('[' + str + ']', str.length)
            if (str === "ok\n") {
                res.send('<img src="http://localhost:1080/static/kme/' + hex + '.png" />')
                return
            } else {
                res.send('<p> error occure :' + str + '</p>')
                return
            }
        });
    });
});




app.listen(1080);