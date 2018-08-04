var http = require('http');
var path = require('path');
var Express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var app = Express();
var shell= require('shelljs');
var exshell= require('exec-sh');
var mongoose=require("mongoose");
var cors = require('cors');
var fs = require('fs');
var bcrypt=require('bcrypt');
var User=require('./model/usermodel');
var result=require('./model/resultmodel');
var morgan=require('morgan');
var response={};
var upload = multer().single('imgUploader'); //Field name and max count
mongoose.Promise = global.Promise;
var connection = mongoose.connect('mongodb://localhost:27017/MathParser',  { useNewUrlParser: true} );
var postheaders = {
    'app_id' : 'liranlr1992_gmail_com',
    'app_key' : '953eb7027c03de769781',
    'Content-Type': 'application/json',
    crossOrigin: true
};

var options = {
    host: 'api.mathpix.com',
    path: '/v3/latex',
    method: 'POST',
    headers: postheaders
};
//app.use(Express.static('/'));


app.use(cors());
app.use(Express.static(path.join(__dirname, '/js')));
app.use(Express.static(path.join(__dirname, '/public')));
app.use(Express.static(path.join(__dirname, '/css')));
//app.use(Express.bodyParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(morgan('combined'));


app.get("/home", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/", function (req, res) {
    // console.log(path.join(__dirname, "js"));
    res.sendFile(__dirname + "/mainpage.html");
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
        post_req.write(JSON.stringify(fileInfo[0]));
        post_req.end();
    });
});


app.post("/getstrokeresult", function (req, res) {

    console.log("Reached backend get");

    //let scgText = Object.keys(req.query)[0];
    let scgText=req.body.scgdata;
    console.log(scgText);
    scgText = scgText.replace(/X/g, '\n');
    console.log("after:");
    console.log(scgText);
    //console.log("This is request body", req.body.data);
    //var scgText = req.body.data;
    //var filename = 'scgtext' + counter.toString() + '.scgink';
    //counter += 1;
    fs.writeFile('scgtext.scgink', scgText, function(err){
        if(err){
            console.log(err);
            res.send(err);
        }
        else{
            exshell('touch output.txt && rm output.txt  && cd seshat-master && ./seshat -c Config/CONFIG -i ../scgtext.scgink -r ../render.pgm >> ../output.txt', {}, function(err){
                if (err) {
                    console.log("Exit code: ", err.code);
                    res.send(err);
                    return err;
                }
                else {

                    fs.readFile('./output.txt', "utf-8", function read(err, data) {
                        if (err) {
                            res.send(err);
                            return err;
                        }
                        else {
                            exshell('touch latex.txt && rm latex.txt && tail -1 output.txt >> ./latex.txt', {}, function (err) {
                                if (err) {
                                    res.send(err);
                                    console.log("Exit code: ", err.code);
                                }
                                else {
                                    fs.readFile('./latex.txt', "utf-8", function read(err, data) {
                                        if (err) {
                                            res.send(err);
                                            return err;
                                        }
                                        var latex_content;
                                        latex_content = data;
                                        latex_content=latex_content.trim();
                                        console.log("ltx ct", latex_content);
                                        //res.setHeader('Content-Type', 'application/json');
                                        // res.body({latex_content: latex_content});
                                        // res.status(201).send();
                                        // console.log(res);
                                        res.send(latex_content);

                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});


function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}


app.get("/test", function (req,res) {

    console.log("reached test api");
    res.send("reached test api");


});

app.get("/signupsuccess", function (req,res) {

    console.log("reached signupsuccess api");
    //res.send("reached test api");
    res.sendFile(__dirname + "/SignUp_success.html");


});


app.post("/signup", signUp);
function signUp(req,res,next) {

    console.log("Reached SignUp API", req.body);
//  creating a document
    var email = req.body.email;
    var username = req.body.username;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var pw = req.body.password;
    var institute=req.body.institute;



    var addUser = new User({

        email: email,
        userName: username,
        firstName: firstname,
        lastName: lastname,
        passWord: pw,
        institute:institute,
        createdDate:Date.now(),
        counter:0

    });

//  For sending mail
    var mailOptions = {
        from: '@gmail.com',
        to: addUser.emailID,
        subject: 'Verification code',
        text: ''
    };

//  encrypting password
    addUser.passWord = myHasher(addUser.passWord);

//  adding a document to database
    var query = {"userName": username};
    User.findOne(query, function (err, seeUser) {
        if(seeUser==null||seeUser==undefined) {
            addUser.save(function (err) {
                if (err) {
                    response["status"] = "false";
                    response["msg"] = "can't add user";
                    res.send(response);
                    console.log("unable to add : " + addUser.userName);
                }
                else {
                    response["status"] = "true";
                    response["msg"] = "Account Added successfully. Please check your email to verify your account.";
                    //sendMaill(mailOptions);
                    res.send(response);
                    console.log("New User Added : " + addUser.userName);
                }
            });
        }
        else{
            response["status"] = "false";
            response["msg"] = "User already exists.";
            res.send(response);
            console.log("User already exists with username : " + addUser.userName);
        }
    });
};



let myHasher = function(password) {
    if(password.trim()==="")
        return "";
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

app.post('/login', Login);

function Login(req, res){

    var query={"userName":req.body.username};
    console.log(req.body.username);
    User.findOne(query, function(err, user){
        if (err){
            console.log("incorrect username");
            response["msg"]="User not found";
            response["status"]=false;
            res.send(response);
        }
        else
        {
            if(user===undefined||user===null)
            {
                console.log("incorrect username");
                response["msg"]="User not found";
                response["status"]=false;
                res.send(response);
            }

            else{
                console.log("found this user", user);
                response["status"]=true;
                response["msg"]={"user":user.userName, "institute":user.institute};
                res.send(response);
            }
        }
    })
};



app.listen(2000, function(err) {
    console.log("Listening to port 2000");
});
