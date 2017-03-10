(function() {
    'use strict';
    var app = angular.module('myApp',[]);
    app.controller('userCtrl', ['userSRV','$scope', function (userSRV,$scope) {
        $scope.users = [];

        angular.element(document).ready(function () {
            userSRV.getUsers(function (users) {
                $scope.users = users;

            });
        });

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
        $scope.showList = function() {
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