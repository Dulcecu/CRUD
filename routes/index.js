var express = require('express'),
    bodyParser = require('body-parser');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
var app = express();
var mongoose = require('mongoose');
var users = mongoose.Schema({
    name: String,
    password: String
});
mongoose.connect("mongodb://localhost:27017/users", function(err, users) {
    if(!err) {
        console.log("We are connected")
    }
});
var Usuario = mongoose.model('users', users);
var u;
app.use(express.static('public'));
app.use(bodyParser.json());
app.post('/push', function (req, res) {

        u=new Usuario({name:req.body.name,password:req.body.password});
        u.save().then(function(){})
        var users = []
        Usuario.find(function(err,usuarios){
            for (var i = 0; i < usuarios.length; i++) {
                users.push({name: usuarios[i].name, password: usuarios[i].password, done:false});
            }

            res.send(users);
        });
});
app.put('/update', function (req, res) {
    var userList=[];

    Usuario.findOneAndUpdate({name:req.body.name},{password:req.body.new}).then(function () {
        Usuario.find(function (err, usuarios) {
            for (var i = 0; i < usuarios.length; i++) {
                userList.push({name: usuarios[i].name, password: usuarios[i].password});
            }
            res.send(userList);

        });
    })
});

app.delete('/delete', function (req, res) {

    if(req.body.checked=="false")
    {
        Usuario.findOneAndRemove({name:req.body.name,password:req.body.password}, function (err, user){
        })
    }
    else {
        var listDelete = req.body;
        var i = 0;
        var len = listDelete.length;
        for (; i < len; i++) {
            Usuario.findOneAndRemove({name: listDelete[i]}, function () {
            });
        }
    }
    var users = []
    Usuario.find(function(err,usuarios){
        for (var i = 0; i < usuarios.length; i++) {
            users.push({name: usuarios[i].name, password: usuarios[i].password, done:false});
        }
        res.send(users);
    });
});
app.get('/all', function (req,res) {
    var users = []
    Usuario.find(function(err,usuarios){
        for (var i = 0; i < usuarios.length; i++) {
            users.push({name: usuarios[i].name, password: usuarios[i].password, done:false});
        }

        res.send(users);
    });
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

app.listen(3500, function () {
    console.log('App listening on port 3500!!')
});
module.exports = router;
// Retrieve
