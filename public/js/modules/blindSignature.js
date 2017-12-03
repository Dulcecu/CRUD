(function() {
    'use strict';
    var app = angular.module('myApp');
    app.service('blindMOD', ['$http',function ($http) {
    var b=bigInt.zero;

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

        this.genBRSA=function () {

            var base=bigInt(2);
            var prime=false;

            while (!prime) {
                b = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
                prime = bigInt(b).isPrime()
            }
            return b
        };
        this.decodeBlind=function (buff,serverE,serverN) {

            var res=bigInt(buff);
            var signature=res.multiply(b.modInv(serverN));
            return(convertFromHex(signature.modPow(serverE,serverN).toString(16)));
        };


        this.sendMessageBlinded = function (serverE,serverN,message, callback) {

            if(b==bigInt.zero){b= this.genBRSA()}
            var bfactor= b.modPow(serverE,serverN);
            var buff = convertToHex(message.message);
            var messageH = bigInt(buff, 16);
            var enmessage=messageH.multiply(bfactor).mod(serverN);
            var data={
                message:enmessage
            };
            var req = {
                method: 'POST',
                url: '/blindSign',
                headers: {'Content-Type': 'application/json'},
                data: data

            };
            $http(req).then(function (buff) {
                callback(buff.data)
            });
        };

    }]);
})();