'use strict';

(function(window, angular) {
  angular.module('app.controllers.Connection', [])
    .controller('ConnectionCtrl', function($scope, $mdDialog, ConfigService) {

      $scope.config = ConfigService.getConfig();
      let configFile = ConfigService.getConfigFile();

      $scope.save = function() {

        fse.writeJson(configFile, $scope.config, function(err) {
          if (err) {
            $mdDialog.show(
              $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .title('Error!')
              .textContent('ไม่สามารถบันทึกค่าได้ ['+ JSON.stringify()+']')
              .ariaLabel('Alert Dialog')
              .ok('ตกลง')
            );
          } else {
            var confirm = $mdDialog.confirm()
              .title('แจ้งเตือน')
              .textContent('การบันทึกข้อมูลเสร็จเรียบร้อยแล้ว คุณจำเป็นต้องทำการปิดโปรแกรม แล้วเริ่มใหม่')
              .ariaLabel('Alert')
              .ok('ใช่ ปิดโปรแกรม!')
              .cancel('ทำงานต่อ');
            $mdDialog.show(confirm).then(function() {
              ipcRenderer.sendSync('close-program');
            }, function() {

            });

          }
        })
      }
    })
})(window, window.angular);
