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
        this.getUsers = function (callback) {

            $http.get('/all').then(function (response) {
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