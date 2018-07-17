"use strict";

const express = require('express');
const app = express();
const childProcess = require("child_process");
const fs = require('fs');
const port = 1080
var oldSpawn = childProcess.spawn;
childProcess.spawn = mySpawn;


// this is the debug function
function mySpawn() {
    console.log('spawn called');
    console.log(arguments);
    var result = oldSpawn.apply(this, arguments);
    return result;
}

// save the working directory to use for path
app.working_dir = process.cwd()

app.set('view engine', 'ejs')
// make public forlder avaliable as static for web client
app.use('/static', express.static('public'))
app.use(express.bodyParser());

app.get('/', function (req, res) {
    res.render('home')
});

app.post('/subproc', function (req, res) {
    // read the data and alpha
    var data = req.body.data
    var alpha = req.body.alpha
    // print some debug information
    console.log(data.length)

    // calculate the md5 hash incluing the alpha parammeters
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
        // pass the path and alpha for python process
        var swapArgs = ['kme.py', path, alpha]

        // explicetly call the python3
        var prc = childProcess.spawn('python3', swapArgs, {
            // relative path to the kme.py file
            cwd: app.working_dir + '/../py/'
        });

        prc.stdout.setEncoding('utf8');

        prc.stdout.on('data', function (data) {
            // uses the std for interprocess communication
            var str = data.toString();

            console.log('[' + str + ']', str.length)
            if (str === "ok\n") {
                // return the image
                res.send('<img src="/static/kme/' + hex + '.png" />')
                return
            } else {
                // display the error on the client and console
                console.log('error occure :' + str)
                res.send('<p> error occure :' + str + '</p>')
                return
            }
        });
    });
});

app.listen(port);