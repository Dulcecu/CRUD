(function() {
    'use strict';
    var app = angular.module('myApp',[]);
    app.controller('userCtrl', ['userSRV','blindMOD','nonRepMOD','$scope', function (userSRV, blindMOD, nonRepMOD, $scope) {
        $scope.users = [];
        var p=bigInt.zero;
        var q=bigInt.zero;
        var n=bigInt.zero;
        var d=bigInt.zero;
        var b=bigInt.zero;
        var serverN=bigInt.zero;
        var serverE=bigInt.zero;
        var e= bigInt(65537);
        var keys, encA, encB, encAB, encABC;
        $scope.info2=false;
        $scope.infoserver="Faltan datos del servidor";
        $scope.results="";
        angular.element(document).ready(function () {
            userSRV.getUsers(function (users) {
                $scope.users = users;

            });
        });
        function convertFromHex(hex) {
            var hex = hex.toString();
            var str = '';
        for (var i = 0; i < hex.length; i += 2){
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
        }
        return str; }
        function convertToHex(str) {
            var hex = '';
            for(var i=0;i<str.length;i++) {
                hex += ''+str.charCodeAt(i).toString(16);
            }
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
        };
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
            $scope.info2=true;

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

            if($scope.textMessageB!=null)
            {
                var data = {
                    message: $scope.textMessageB+" BLIND"
                };
                blindMOD.sendMessageBlinded(serverE,serverN,data, function (buff) {

                    $scope.results= blindMOD.decodeBlind(buff,serverE,serverN)
                    $scope.textMessageS="";
                });
            }

        };
        $scope.sendThreshold=function () {

            var data={
                password:$scope.textThreshold,
                parts:$scope.parts,
                threshold:$scope.threshold
            };
            userSRV.sendThreshold(data,function (res) {
                $scope.textThreshold="";
                $scope.parts="";
                $scope.threshold=""
                //console.log(res)
            })
        };

        $scope.sendRepudiation=function () {

            if(n==bigInt.zero){$scope.genNRSA(function () {})}
            if($scope.textRepudiation!=null)
            {
                var origin="A";
                var destination="B";
                var thirdpart="TTP";
                var message=$scope.textRepudiation;
                var server = 'http://localhost:3500';
                var sharedKey="Masmiwapo";

                nonRepMOD.sendMessageToSever(origin,destination,thirdpart,server,sharedKey,d,n,e,message,function (buff) {

                    if(buff.origin===undefined)
                    {
                        $scope.results="ERROR WAPO WAPO";
                        $scope.textRepudiation="";
                    }
                    else {
                        nonRepMOD.checkPayload(buff.origin,buff.destination,buff.message,serverE,serverN,buff.signature,function (res) {

                            if(res === 1){

                                var ttp = 'http://localhost:3600';
                                console.log("A consultar con la tercera parte ");
                                nonRepMOD.sendMessageToThirdPart(origin,destination,sharedKey,thirdpart,d,n,e,ttp,function (buff2) {

                                    nonRepMOD.checkPayloadTTP(buff2.origin,buff2.destination,buff2.key,buff2.TTPE,buff2.modulusTTP,buff2.thirdpart,buff2.signature,function (res2) {

                                        if(res2 === 1){
                                            console.log("La clave compartida es: "+ sharedKey);
                                            var message = CryptoJS.AES.decrypt(buff.message,sharedKey).toString(CryptoJS.enc.Utf8);
                                            console.log("El mensaje es: "+message);
                                            $scope.results = "TTP LO HA HECHO BIEN";
                                            $scope.textRepudiation="";
                                        }

                                        else {
                                            $scope.results = "ERROR MASMASTICO"
                                        }

                                    });

                                });
                            }
                            else {
                                $scope.results = "ERROR WAPO"
                            }
                        });
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