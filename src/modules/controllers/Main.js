(function (window, angular) {
  'use strict';

  angular.module('app.controllers.Main', ['app.services.Main'])
  .controller('MainCtrl', function ($scope, $rootScope, $state, $log, $window, MainService) {

    if (!$window.sessionStorage.getItem('logged')) {
      $state.go('login')
    } else {
      MainService.getHospital()
        .then(function (rows) {
          $rootScope.hospitalName = rows.hospitalname;
          $rootScope.hospitalCode = rows.hospitalcode;
        })
    }
  })
})(window, window.angular);
