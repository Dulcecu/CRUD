(function() {
    'use strict';
    var app = angular.module('myApp');
    app.service('nonRepMOD', ['$http',function ($http) {

        function convertToHex(str) {
            var hex = '';
            for(var i=0;i<str.length;i++) {
                hex += ''+str.charCodeAt(i).toString(16);
            }
            return hex; }

        function convertFromHex(hex) {
            var hex = hex.toString();
            var str = '';
            for (var i = 0; i < hex.length; i += 2){
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
            }
            return str; }


        this.sendMessageToSever = function (origin, destination, thidpart, server, sharedKey,d,n,e, message, callback) {

            var cypher=CryptoJS.AES.encrypt(message,sharedKey).toString();
            var string=origin+"."+destination+"."+cypher;
            var hash=CryptoJS.SHA256(string).toString();
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

            var url = server+'/repudiationSigned';

            var req = {
                method: 'POST',
                url: url,
                headers: {'Content-Type': 'application/json'},
                data: data

            };
            $http(req).then(function (buff) {
                callback(buff.data)
            });
        };

        this.checkPayload = function (origin, destination, message, serverE, serverN,signature, callback) {

            var buffS;
            /////////
            var sigmessage = bigInt(signature);
            var signature2 = sigmessage.modPow(serverE, serverN);
            buffS = convertFromHex(signature2.toString(16)).toString();
            //////////
            var string = origin + "." + destination + "." + message;
            var hash = CryptoJS.SHA256(string).toString();

            if (hash === buffS) {
                callback(1)
            }
            else{
                callback(0)
            }
        };

        this.checkPayloadTTP = function (origin, destination, key, TTPE, modulusTTP, thirdpart, signature, callback) {

            var buffS;
            /////////
            var sharedKey=key;
            var modulus= bigInt(modulusTTP);
            var publicE=TTPE;
            /////////
            var sigmessage=bigInt(signature);
            var signature2=sigmessage.modPow(publicE,modulus);
            buffS = convertFromHex(signature2.toString(16)).toString();
            //////////
            var string=thirdpart+"."+origin+"."+destination+"."+sharedKey;
            var hash = CryptoJS.SHA256(string).toString();

            if (hash === buffS) {
                callback(1)
            }
            else{
                callback(0)
            }
        };

        this.sendMessageToThirdPart = function (origin, destination, sharedKey, thirdpart, d, n, e, ttp, callback) {

            var string=origin+"."+thirdpart+"."+destination+"."+sharedKey;
            var hash=CryptoJS.SHA256(string).toString();
            var signature=convertToHex(hash);
            var messageS=bigInt(signature, 16);
            var sigmessage=messageS.modPow(d,n);

            var data = {
                origin:origin,
                thirdpart:thirdpart,
                destination:destination,
                key:sharedKey,
                signature:sigmessage,
                modulus:n,
                publicE:e
            };

            var url = ttp+'/repudiationThirdPart';

            var req = {
                method: 'POST',
                url: url,
                headers: {'Content-Type': 'application/json'},
                data: data

            };
            $http(req).then(function (buff) {
                callback(buff.data)
            });
        };

    }]);
})();