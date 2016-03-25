((window, angular) => {
    "use strict";

    angular.module('app.controllers.StateView', ['app.services.StateView'])
    .controller('StateViewCtrl', ($scope, $rootScope, $state, $stateParams, $window, $log, StateViewService) => {

      if (!$window.sessionStorage.getItem('logged')) {
        $state.go('login')
      }

        $scope.type = $stateParams.type;
        $scope.state = $stateParams.state;

        $log.info($stateParams);

        $scope.hns = [];
        $scope.patientCkd = [];
        $scope.patientCvd = [];

        if ($stateParams.type == 'ckd') {
            if ($stateParams.state == 1) {
                $scope.hns = $rootScope.patientCKDState.state1;
            } else if ($stateParams.state == 2) {
                $scope.hns = $rootScope.patientCKDState.state2;
            } else if ($stateParams.state == 3) {
                $scope.hns = $rootScope.patientCKDState.state3;
            } else if ($stateParams.state == 4) {
                $scope.hns = $rootScope.patientCKDState.state4;
            } else if ($stateParams.state == 5) {
                $scope.hns = $rootScope.patientCKDState.state5;
            }
        } else if ($stateParams.type == 'cvd') {
            if ($stateParams.state == 1) {
                $scope.hns = $rootScope.patientCVDState.state1;
            } else if ($stateParams.state == 2) {
                $scope.hns = $rootScope.patientCVDState.state2;
            } else if ($stateParams.state == 3) {
                $scope.hns = $rootScope.patientCVDState.state3;
            } else if ($stateParams.state == 4) {
                $scope.hns = $rootScope.patientCVDState.state4;
            } else if ($stateParams.state == 5) {
                $scope.hns = $rootScope.patientCVDState.state5;
            }
        }

        $scope.showProgress = true;
      if ($stateParams.type == 'ckd') {
          StateViewService.getCkd($stateParams.start, $stateParams.end, $scope.hns)
              .then((rows) => {
                  $log.info(rows);
                  $scope.patientCkd = rows;
                  $scope.showProgress = false;
              }, (err) => {
                  $log.error(err);
                  $scope.showProgress = false;
              });
      } else {
          StateViewService.getCvd($stateParams.start, $stateParams.end, $scope.hns)
              .then((rows) => {
                  $scope.patientCvd = rows;
                  $scope.showProgress = false;
              }, (err) => {
                  $log.error(err);
                  $scope.showProgress = false;
              });
      }


    })
})(window, window.angular);