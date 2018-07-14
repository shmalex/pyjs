"use strict";

const express = require('express');
const app = express();
const spawn = require("child_process").spawn;
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

console.log(process.cwd())

//app.set('view engine', 'pug')
app.set('view engine', 'ejs')

app.use('/static', express.static('public'))
app.use(express.bodyParser());


app.get('/', function (req, res) {
    res.render('home')
});

app.post('/subproc', function (req, res) {
    var data = req.body.data
    console.log(data.length)
    var crypto = require('crypto');
    var hex = crypto.createHash('md5').update(data).digest("hex");
    var path = process.cwd() + '/data/' + hex + '.csv'
    console.log(path)

    fs.writeFile(path, data, function (err) {
        if (err) {
            res.send('oops' + path)
            return console.log(err);
        }

        console.log("The file was saved!");
        var swapArgs = ['kme.py', path]
        var prc = childProcess.spawn('python', swapArgs, {
            cwd: '/home/shmalex/Desktop/py/projects/pyjs/py/'
        });

        prc.stdout.setEncoding('utf8');

        prc.stdout.on('data', function (data) {
            var str = data.toString();
            console.log('[' + str + ']', str.length)
            if (str === "ok\n") {
                res.send('<img src="http://localhost:1080/static/kme/' + hex + '.png" />')
                return
            } else {
                res.send('it was :' + str + '-')
                return
            }
        });
    });
});




app.listen(1080);