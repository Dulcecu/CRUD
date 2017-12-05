var HashJS= require('crypto-js/sha256');
var bigInt = require("big-integer");
var request=require('request');
var CryptoJS = require("crypto-js");
var criptogram = 0;

module.exports = {

    checkPayload: function (origin,destination,message,modulus,publicE,signature, callback) {

        var buffS;
        /////////
        criptogram = message;
        var modulus2= bigInt(modulus);
        /////////
        var sigmessage=bigInt(signature);
        var signature2=sigmessage.modPow(publicE,modulus2);
        buffS=Buffer.from(signature2.toString(16),'hex').toString();
        //////////
        var string=origin+"."+destination+"."+message;
        var hash=HashJS(string);

        if(hash==buffS) {
            callback(1);
        }
        else{
            callback(0);
        }
    },
    checkPayloadTTP: function (origin,destination,thirdpart,key,modulus,publicE,signature,callback) {

        var buffS;
        /////////
        var sharedkey=key;
        var modulus2= bigInt(modulus);
        /////////
        var sigmessage=bigInt(signature);
        var signature2=sigmessage.modPow(publicE,modulus2);
        buffS=Buffer.from(signature2.toString(16),'hex').toString();
        //////////
        var string=origin+"."+thirdpart+"."+destination+"."+sharedkey;
        var hash=HashJS(string);
        if(hash==buffS) {
            callback(1);
        }
        else{
            callback(0);
        }
    },
    shareKey: function (origin,destination,thirdpart,d,n,e,sharedkey,callback) {

        var string=thirdpart+"."+origin+"."+destination+"."+sharedkey;
        var hash=HashJS(string);
        var buff=Buffer.from(hash.toString(),'utf8');
        var message=bigInt(buff.toString('hex'),16);
        var enmessage=message.modPow(d,n);
        var data = {
            thirdpart:thirdpart,
            origin:origin,
            destination:destination,
            key:sharedkey,
            signature: enmessage,
            modulusTTP:n,
            TTPE:e
        };
        console.log("colgando la clave para A y B");
        callback(data);

    },
    returnMessagefromServer: function (origin, destination, message,d,n,callback) {

        string=destination+"."+origin+"."+message;
        hash=HashJS(string);
        var buff=Buffer.from(hash.toString(),'utf8');
        var message2=bigInt(buff.toString('hex'),16);
        var enmessage=message2.modPow(d,n);
        var data = {
            origin:destination,
            destination:origin,
            signature: enmessage,
            message:message

        };
        callback(data);
    },
    consultTTP: function (ttpURL) {

        console.log("He conseguido K?");

        var url = ttpURL+'/getKey';

        request(url, function (error, response, body) {

            if(body!=0) {

                var datos = JSON.parse(response.body);
                var buffS;
                /////////
                var thirdpart = datos.thirdpart;
                var origin = datos.origin;
                var destination = datos.destination;
                var sharedKey = datos.key;
                var modulus = bigInt(datos.modulusTTP);
                var publicE = datos.TTPE;
                /////////
                var sigmessage = bigInt(datos.signature);
                var signature = sigmessage.modPow(publicE, modulus);
                buffS = Buffer.from(signature.toString(16), 'hex').toString();
                //////////
                var string = thirdpart + "." + origin + "." + destination + "." + sharedKey;
                var hash = HashJS(string);

                if (hash == buffS) {

                    console.log("La clave compartida es: " + sharedKey);
                    var message = CryptoJS.AES.decrypt(criptogram, sharedKey).toString(CryptoJS.enc.Utf8);
                    console.log("El mensaje es: " + message);

                }
                else {
                    console.log("error");
                }
            }
        });
    }
};

var noExpuesta = function () {

    /*
    HERE YOU CAN DO WHAT YOU WANT THAT ONLY THE FUNCTIONS INSIDE THE JS CAN ACCESS THEM
     */
}