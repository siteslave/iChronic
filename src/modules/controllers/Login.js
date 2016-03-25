((window, angular) => {
  "use strict";

  angular.module('app.controllers.Login', ['app.services.Login'])
  .controller('LoginCtrl', ($scope, $rootScope, $window, $mdDialog, $state, $log, LoginService) => {

    $scope.doLogin = () => {
      if ($scope.username && $scope.password) {
        LoginService.doLogin($scope.username, $scope.password)
        .then((res) => {
          $log.info(res);
          if (res.ok) {
            $window.sessionStorage.setItem('logged', true);
            $state.go('main');
          } else {
            $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('Error!')
                .textContent(JSON.stringify(res.msg))
                .ariaLabel('Alert Dialog')
                .ok('ตกลง')
            );
          }
        }, (err) => {
          $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .title('Error!')
              .textContent('เกิดข้อผิดพลาด ' + err)
              .ariaLabel('Alert Dialog')
              .ok('ตกลง')
          );
        })
      } else {
        $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title('Error!')
            .textContent('กรุณากรอกข้อูลให้ครบ')
            .ariaLabel('Alert Dialog')
            .ok('ตกลง')
        );
      }

    }

  });

})(window, window.angular);