(function() {
    'use strict';
    var app = angular.module('myApp',[]);
    app.controller('userCtrl', ['userSRV','$scope', function (userSRV,$scope) {
        $scope.users = [];
        var p=bigInt.zero;
        var q=bigInt.zero;
        var n=bigInt.zero;
        var d=bigInt.zero;
        var b=bigInt.zero;
        var serverN=bigInt.zero;
        var serverE=bigInt.zero;
        var e= bigInt(65537);
        var sharedKey="Masmiwapo"
        $scope.info2=false;
        $scope.infoserver="Faltan datos del servidor";
        $scope.results="";
        angular.element(document).ready(function () {
            userSRV.getUsers(function (users) {
                $scope.users = users;

            });
        });
        function convertFromHex(hex) { var hex = hex.toString();
        var str = ''; for (var i = 0; i < hex.length; i += 2)str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str; }
        function convertToHex(str) { var hex = ''; for(var i=0;i<str.length;i++) { hex += ''+str.charCodeAt(i).toString(16); }
        return hex; }

        $scope.userAdd = function(){
            var newUser = {
            name: $scope.userName,
            password: $scope.userPass
        };
        userSRV.pushUser(newUser,function (users) {
            $scope.userName = "";
            $scope.userPass = "";
            $scope.users = users;
        });
            };
        $scope.filterdb=function(){
            userSRV.filterdb($scope.filterDB,function (users) {

                $scope.users = users;
                $scope.userName = "";
                $scope.userPass = "";
                $scope.filterDB="";

            })

        };
        $scope.genBRSA=function () {

            var base=bigInt(2);
            var prime=false;

            while (!prime) {
                b = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
                prime = bigInt(b).isPrime()
            }
        }
        $scope.genNRSA=function () {

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
        $scope.serverData = function() {

            userSRV.getServer(function (data) {
                serverN= data.modulus;
                serverE= data.serverE
            });
            $scope.infoserver="Informacion del servidor disponible ";
            $scope.info2=true

        };

        $scope.send=function () {

            if((serverN!=bigInt.zero)&&($scope.textMessage!=undefined))
            {
                var buff = convertToHex($scope.textMessage);
                var message = bigInt(buff, 16);
                var enmessage = message.modPow(serverE, serverN);
                var data = {
                    message: enmessage
                };
                userSRV.sendMessage(data, function (buff) {
                $scope.results=buff;
                $scope.textMessage="";
                });
            }
            else {
                this.serverData(function () {
                    $scope.infoserver="Faltan datos del servidor"
                })
            }
        };
        $scope.sendSignature=function () {

            if(n==bigInt.zero){$scope.genNRSA(function () {})}
            if($scope.textMessageS!=null)
            {
                var buff = convertToHex($scope.textMessageS);
                var signature=convertToHex($scope.textMessageS+" SIGNED");
                var message = bigInt(buff, 16);
                var messageS=bigInt(signature, 16);
                var enmessage = message.modPow(serverE, serverN);
                var sigmessage=messageS.modPow(d,n);
                var modulus=n;
                var data = {
                    message: enmessage,
                    signature:sigmessage,
                    modulus:n,
                    publicE:e
                };
                userSRV.sendMessageSigned(data, function (buff) {
                    $scope.results=buff;
                    $scope.textMessageS="";
                });
            }

        };

        $scope.sendBlind=function () {

            if(b==bigInt.zero){$scope.genBRSA(function () {})}
            if($scope.textMessageB!=null)
            {
                var bfactor= b.modPow(serverE,serverN)
                var buff = convertToHex($scope.textMessageB+" BLIND");
                var message = bigInt(buff, 16);
                var enmessage=message.multiply(bfactor).mod(serverN)
                var data = {
                    message: enmessage
                };
                userSRV.sendMessageBlinded(data, function (buff) {
                    var res=bigInt(buff)
                    var signature=res.multiply(b.modInv(serverN))
                    $scope.results= convertFromHex(signature.modPow(serverE,serverN).toString(16));
                    $scope.textMessageS="";
                });
            }

        };

        $scope.sendRepudiation=function () {

            if(n==bigInt.zero){$scope.genNRSA(function () {})}
            if($scope.textRepudiation!=null)
            {
                var origin="A"
                var destination="B"
                var message=$scope.textRepudiation
                var cypher=CryptoJS.AES.encrypt(message,sharedKey).toString();
                var string=origin+"."+destination+"."+cypher
                var hash=CryptoJS.SHA256(string).toString()
                var signature=convertToHex(hash);
                var messageS=bigInt(signature, 16);
                var sigmessage=messageS.modPow(d,n);
                var data = {
                    origin:origin,
                    destination:destination,
                    message: cypher,
                    signature:sigmessage,
                    modulus:n,
                    publicE:e
                };
                userSRV.sendMessageSignedRepudiation(data, function (buff) {

                    if(buff.origin==undefined)
                    {
                        $scope.results="ERROR WAPO WAPO"
                        $scope.textRepudiation="";
                    }
                    else {
                        var buffS;
                        /////////
                        var origin = buff.origin;
                        var destination = buff.destination;
                        var message = buff.message;
                        var string = origin + "." + destination + "." + message;
                        var sigmessage = bigInt(buff.signature);
                        var signature = sigmessage.modPow(serverE, serverN);
                        buffS = convertFromHex(signature.toString(16)).toString()
                        //////////
                        var string = origin + "." + destination + "." + message;
                        var hash = CryptoJS.SHA256(string).toString();
                        if (hash == buffS) {
                            $scope.results = "Masmi es el mas pulido";
                        } else {
                            $scope.results = "ERROR WAPO"
                        }
                        $scope.textRepudiation="";
                    }

                });
            }
        };

        $scope.showList = function() {

            //var powmessage=enmessage.modPow(d,n);  /// el problema es que powmessage /= de message
            //buff=convertFromHex(powmessage.toString(16));
            //console.log(buff)
            userSRV.getUsers(function (users) {

                $scope.users = users;

            });
        };
        $scope.update=function(){
            var data = {
                name: $scope.userName,
                password:$scope.userPass,
                new:$scope.newPass
            };
            $scope.newPass="";
            $scope.userName = "";
            $scope.userPass = "";
            userSRV.updateUser(data,function (list) {
                $scope.users=list
            });

        };
        $scope.remove = function() {

            if($scope.checked) {
                var deltedUsers = [];
                angular.forEach($scope.users, function (user) {
                    if (user.done) {
                        deltedUsers.push(user.name);
                    }
                });
                userSRV.removeUsers(deltedUsers, function (list) {
                    $scope.users = list;
                });
            }
            else {
                var data = {
                    name: $scope.userName,
                    password: $scope.userPass,
                    checked: "false"
                };

                userSRV.removeUsers(data, function (list) {

                    $scope.users = list;

                });
            }
            $scope.userName = "";
            $scope.userPass = "";
        };
    }]);
})();