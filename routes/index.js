var express = require('express'),
    bodyParser = require('body-parser');
var router = express.Router();
var HashJS= require('crypto-js/sha256');
var CryptoJS = require("crypto-js");
var secrets= require("secrets.js")
var request=require('request');
var nonRep = require('./nonRepudiation');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
var app = express();
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/users", function(err) {
    if(!err) {
        console.log("We are connected")
    }
});
var Usuario = require('../models/users');
var u;
var bigInt = require("big-integer");
var p=bigInt.zero;
var q=bigInt.zero;
var n=bigInt.zero;
var d=bigInt.zero;
var e= bigInt(65537);
var criptogram = 0;
app.use(express.static('public'));
app.use(bodyParser.json());

returnAll=function (callback) {

    var users = [];
    Usuario.find(function(err,usuarios){
        for (var i = 0; i < usuarios.length; i++) {
            users.push({name: usuarios[i].name, password: usuarios[i].password, done:false});
        }

        callback(users)
    });
};

genNRSA=function () {

    var base=bigInt(2);
    var prime=false;

    while (!prime) {
        p = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
        prime = bigInt(p).isPrime()

    }
    prime = false;
    while (!prime) {
        q = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
        prime = bigInt(q).isPrime()
    }
    var phi = p.subtract(1).multiply(q.subtract(1));
    n = p.multiply(q);
    d = e.modInv(phi);

};

app.post('/threshold',function (req,res) {

    var password= req.body.password
    var passHex=secrets.str2hex(password)
    var parts=parseInt(req.body.parts)
    var threshold= parseInt(req.body.threshold)
    var shares=secrets.share(passHex,parts,threshold)

    var combine=secrets.combine([shares[1],shares[2]])
    console.log(secrets.hex2str(combine))
    res.send(shares[1])

})

app.post('/push', function (req, res) {


        Usuario.findOne({name:req.body.name},function(err,usuarios){

            if(usuarios!=null){

            }
            else{
                u=new Usuario({name:req.body.name,password:req.body.password});
                u.save().then(function(){})
            }
        });

    this.returnAll(function (callback) {
        res.send(callback)
    })
});
app.put('/update', function (req, res) {
    var userList=[];

    Usuario.findOneAndUpdate({name:req.body.name,password:req.body.password},{password:req.body.new}).then(function () {
        Usuario.find(function (err, usuarios) {
            for (var i = 0; i < usuarios.length; i++) {
                userList.push({name: usuarios[i].name, password: usuarios[i].password});
            }
            res.send(userList);

        });
    })
});

app.delete('/delete', function (req, res) {

    var listDelete =req.body;
    var i = 0;
    var len = listDelete.length;
    if(len!=undefined) {
        for (; i < len; i++) {
            Usuario.findOneAndRemove({name: listDelete[i]}, function () {
            });
        }
    }
    else
    {
        Usuario.findOneAndRemove({name:listDelete.name},function () {

        })
    }

    this.returnAll(function (callback) {
        res.send(callback)
    })
});
app.post('/encode',function (req,res) {

    if(n==bigInt.zero){
        this.genNRSA(function () {

        })
    }
    else{
        var buff;
        var enmessage=req.message.modPow(e,n);
        var powmessage=enmessage.modPow(d,n);  /// el problema es que powmessage /= de message
        buff=Buffer.from(powmessage.toString(16),'hex');
    }

});

app.post('/decode',function (req,res) {

    if(n==bigInt.zero){
        this.genNRSA(function () {

        })
    }
    else{

        var buff;
        var message=bigInt(req.body.message);
        var powmessage=message.modPow(d,n);
        buff=Buffer.from(powmessage.toString(16),'hex');
        res.send(buff)
    }

});
app.post('/blindSign',function (req,res) {

    if(n==bigInt.zero){
        this.genNRSA(function () {

        })
    }
    else{

        var message=bigInt(req.body.message);
        var powmessage=message.modPow(d,n);
        res.send(powmessage)
    }

});
app.post('/decodeSigned',function (req,res) {

    if(n==bigInt.zero){
        this.genNRSA(function () {

        })
    }
    else{

        var buff;
        var buffS;
        var message=bigInt(req.body.message);
        var sigmessage=bigInt(req.body.signature);
        var modulus= bigInt(req.body.modulus);
        var powmessage=message.modPow(d,n);
        var publicE=req.body.publicE;
        var signature=sigmessage.modPow(publicE,modulus);
        buff=Buffer.from(powmessage.toString(16),'hex');
        buffS=Buffer.from(signature.toString(16),'hex');
        res.send(buffS)
    }

});

app.post('/repudiationSigned',function (req,res) {

    if(n===bigInt.zero){
        this.genNRSA(function () {})
    }
    else{
        nonRep.checkPayload(req.body.origin,req.body.destination,req.body.message,req.body.modulus,req.body.publicE,req.body.signature,function (buff) {

            if(buff === 1){

                nonRep.returnMessagefromServer(req.body.origin,req.body.destination,req.body.message,d,n,function (data) {
                    console.log("He recibido el mensaje de A");

                    res.send(data)
                });
            }
            else {
                console.log("Algo paso");
                res.send("ERROR")
            }
        });
    }
});


app.get('/getServer', function (req,res) {
    if(n==bigInt.zero){
        this.genNRSA(function () {

        })
    }
    var data={
        modulus:n,
        serverE:e
    };
    res.send(data)

});

app.get('/all', function (req,res) {

    this.returnAll(function (callback) {
        res.send(callback)
    })

});

app.get('/filterdb/:letter', function (req, res) {
    var userList=[];
    var letter=req.params.letter;
    Usuario.find({"name":{"$regex": letter} },function (err, us) {
        for (var i = 0; i < us.length; i++) {
            userList.push({name: us[i].name, password: us[i].password, done:false});
        }
        res.send(userList);
    });
});

function putTimer() {
    var ttpURL = 'http://localhost:3600';
    nonRep.consultTTP(ttpURL)
}

app.listen(3500, function () {
    setInterval(function(){ putTimer() },10000);
    console.log('App listening on port 3500!!')
});
module.exports = router;
// Retrieve
