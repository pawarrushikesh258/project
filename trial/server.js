var http = require('http');
var path = require('path');
var Express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var app = Express();

app.use(Express.static(path.join(__dirname, "js")));
var fs = require("fs");

// var Storage = multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, "./Images");
//     },
//     filename: function (req, file, callback) {
//         callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
//     }
// });

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



app.post("/api/Upload", function (req, res) {

  var fileInfo = [];

    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            return res.end("Something went wrong!");
        }
        //for(var i = 0; i < req.files.length; i++) {
        // var i = 0;
            fileInfo.push({
                "src": 'data:image/jpeg;base64,'+new Buffer(req.file.buffer).toString("base64")
            });
            //fs.unlink(req.file.path);
        // //}

       var post_req =   http.request(options, function(res) {
          console.log('STATUS: ' + res.statusCode);
          console.log('HEADERS: ' + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
          });
        });

        console.log(JSON.stringify(fileInfo[0]));
        post_req.write(JSON.stringify(fileInfo[0]));
        post_req.end();

        return res.end("File uploaded sucessfully!.");
      });
    });
//});

// app.post('/api/Upload"', upload.single('avatar'), (req, res) => {
//   if (!req.file) {
//     console.log("No file received");
//     return res.send({
//       success: false
//     });
//
//   } else {
//     console.log('file received');
//     return res.send({
//       success: true
//     })
//   }
// });



function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

 app.listen(2000, function(a) {
    console.log("Listening to port 2000");
});
