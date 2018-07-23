var http = require('http');
var path = require('path');
var Express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var app = Express();
var shell= require('shelljs');
var exshell= require('exec-sh');

app.use(Express.static(path.join(__dirname, "js")));
app.use(Express.static(path.join(__dirname, "css")));
//app.use(Express.bodyParser());


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// app.use(function (req, res) {
//     res.setHeader('Content-Type', 'text/plain');
//     res.write('you posted:\n');
//     res.end(JSON.stringify(req.body, null, 2));
//});

var fs = require("fs");

var upload = multer().single('imgUploader'); //Field name and max count


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

var postheaders = {
    //'app_id' : 'liranlr1992_gmail_com',
    //'app_key' : '953eb7027c03de769781',
    'Content-Type': 'application/json'
};

var options = {
  host: 'api.mathpix.com',
  path: '/v3/latex',
  method: 'POST',
  headers: postheaders
};

app.post("/api/uploadStrokes", function (req, res){

   console.log(req.body);
});


app.post("/api/Upload", function (req, res) {

  var fileInfo = [];

    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            return res.end("Something went wrong!");
        }
        fileInfo.push({
            "src": 'data:image/jpeg;base64,'+new Buffer(req.file.buffer).toString("base64")
        });

       var post_req =   http.request(options, function(resp) {
          console.log('STATUS: ' + res.statusCode);
          console.log('HEADERS: ' + JSON.stringify(res.headers));
          resp.setEncoding('utf8');
          var body ='';
          resp.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            body = chunk;
            body = JSON.parse(body);
            if (body.error) {
              res.send(body.error);
            }
            else {
              res.send(body.latex)
            }
          });

        });

      //  console.log(JSON.stringify(fileInfo[0]));
        post_req.write(JSON.stringify(fileInfo[0]));
        post_req.end();


      //  return res.end("File uploade
});
});

app.get("/api/test", function (req, res) {
    var scgText = Object.keys(req.query)[0];
    console.log(scgText);
    scgText = scgText.replace(/X/g, '\n');
    console.log("after:");
    console.log(scgText);
    //res.send("HELLO");
    //fs.writeFileSync('scgtext.scgink', scgText, {encoding:'utf8',flag:'w'});
    fs.writeFile('scgtext.scgink', scgText, function(err){
        if(err){console.log(err);}
    });

    //shell.exec("./script.sh");

    exshell("touch output.txt && rm output.txt  && cd seshat-master && ./seshat -c Config/CONFIG -i ../scgtext.scgink >> ../output.txt", {}, function(err){
        if (err) {
            console.log("Exit code: ", err.code);
            return;
        }});

});



function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

app.listen(2000, function(a) {
    console.log("Listening to port 2000");
});
