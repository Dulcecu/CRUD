(function() {
    'use strict';
    var app = angular.module('myApp');
    app.service('userSRV', ['$http',function ($http) {

        this.pushUser = function (newUser, callback) {
            var req = {
                method: 'POST',
                url: '/push',
                headers: {'Content-Type': 'application/json'},
                data: newUser

            };
            $http(req).then(function () {
                $http.get('/all').then(function (response) {
                    callback (response.data);

                });
            });
        };
        this.sendMessage = function (message, callback) {

            var req = {
                method: 'POST',
                url: '/decode',
                headers: {'Content-Type': 'application/json'},
                data: message

            };
            $http(req).then(function (buff) {
                callback(buff.data)
            });
        };
        this.sendMessageSigned = function (message, callback) {

            var req = {
                method: 'POST',
                url: '/decodeSigned',
                headers: {'Content-Type': 'application/json'},
                data: message

            };
            $http(req).then(function (buff) {
                callback(buff.data)
            });
        };
        this.sendMessageSignedRepudiation = function (message, callback) {

            var req = {
                method: 'POST',
                url: '/repudiationSigned',
                headers: {'Content-Type': 'application/json'},
                data: message

            };
            $http(req).then(function (buff) {
                callback(buff.data)
            });
        };

        this.sendMessageToThirdPart = function (message, callback) {

            var req = {
                method: 'POST',
                url: 'http://localhost:3600/repudiationThirdPart',
                headers: {'Content-Type': 'application/json'},
                data: message

            };
            $http(req).then(function (buff) {
                callback(buff.data)
            });
        };
        this.sendThreshold=function (message,callback) {
            var req = {
                method: 'POST',
                url: '/threshold',
                headers: {'Content-Type': 'application/json'},
                data: message

            };
            $http(req).then(function (buff) {
                callback(buff.data)
            });
        }

        this.sendMessageBlinded = function (message, callback) {

            var req = {
                method: 'POST',
                url: '/blindSign',
                headers: {'Content-Type': 'application/json'},
                data: message

            };
            $http(req).then(function (buff) {
                callback(buff.data)
            });
        };
        this.getUsers = function (callback) {

            $http.get('/all').then(function (response) {
                callback (response.data);
            });

        };

        this.getServer = function (callback) {

            $http.get('/getServer').then(function (response) {
                callback (response.data);
            });

        };

        this.removeUsers = function (data,callback) {
            var req = {
                method: 'DELETE',
                url: '/delete',
                headers: {'Content-Type': 'application/json'},
                data: data
            };
            $http(req).then(function (response) {

                callback(response.data)

            });
        };
        this.filterdb =function (data,callback) {

            var req = {
                method: 'GET',
                data: data,
                url: '/filterdb/'+data,
                headers: {'Content-Type': 'application/json'}

            };

             $http(req).then(function (response) {

              callback(response.data)

             });
        };
        this.updateUser=function(data,callback){
            var req = {
                method: 'PUT',
                url: '/update',
                headers: {'Content-Type': 'application/json'},
                data: data
            };
            $http(req).then(function (response) {
                callback(response.data)
            });
        }
    }]);
})();