'use strict';

(function(window, angular) {
  angular.module('app.controllers.List', ['app.services.List'])
    .controller('ListCtrl', function($scope, $state, $mdToast, $window, $log, $mdDialog, ListService) {

      if (!$window.sessionStorage.getItem('logged')) {
        $state.go('login')
      } else {

        $scope.patientDm = [];
        $scope.patientHt = [];
        $scope.patientDmTotal = 0;
        $scope.patientHtTotal = 0;
        $scope.showProgress = true;
        $scope.isSearching = true;

        $scope.dmQuery = {
          limit: 15,
          page: 1
        };

        $scope.htQuery = {
          limit: 15,
          page: 1
        };

        $scope.getHtList = () => {
          ListService.getTotal('002')
            .then(function(total) {
              $scope.patientHtTotal = total;
              getHtList();
            });
        };

        $scope.getDmList = () => {
          ListService.getTotal('001')
            .then(function(total) {
              $scope.patientDmTotal = total;
              getDmList();
            });
        };

        let getDmList = function() {
          let _offset = 0;
          $scope.patientDm = [];
          $scope.isSearching = false;

          if ($scope.dmQuery.page <= 1) {
            _offset = parseInt($scope.dmQuery.page) * parseInt($scope.dmQuery.limit);
          }

          let _limit = parseInt($scope.dmQuery.limit);

          ListService.getList('001', _limit, _offset)
            .then(function(rows) {
              rows.forEach(function(v) {
                let obj = {};
                obj.patient_hn = v.patient_hn;
                obj.fullname = v.fullname;
                obj.pttype_name = v.pttype_name;
                obj.birthdate = v.birthdate;
                obj.begin_year = v.begin_year;
                obj.age = v.age;
                $scope.patientDm.push(obj);
              });

              $scope.showProgress = false;
              $mdToast.show(
                $mdToast.simple()
                  .textContent('โหลดข้อมูลเสร็จเรียบร้อยแล้ว')
                  .position('bottom right')
                  .hideDelay(3000)
              );
            }, function (err) {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('Error!: ' + JSON.stringify(err))
                  .position('bottom right')
                  .hideDelay(3000)
              );
            })
        };

        let getHtList = function() {
          let _offset = 0;
          $scope.patientHt = [];
          $scope.isSearchingHt = false;

          if ($scope.htQuery.page <= 1) {
            _offset = parseInt($scope.htQuery.page) * parseInt($scope.htQuery.limit);
          }

          let _limit = parseInt($scope.htQuery.limit);

          ListService.getList('002', _limit, _offset)
            .then(function(rows) {
              rows.forEach(function(v) {
                let obj = {};
                obj.patient_hn = v.patient_hn;
                obj.fullname = v.fullname;
                obj.pttype_name = v.pttype_name;
                obj.birthdate = v.birthdate;
                obj.begin_year = v.begin_year;
                obj.age = v.age;
                $scope.patientHt.push(obj);
              });

              $scope.showProgress = false;
              $mdToast.show(
                $mdToast.simple()
                  .textContent('โหลดข้อมูลเสร็จเรียบร้อยแล้ว')
                  .position('bottom right')
                  .hideDelay(3000)
              );
            }, function (err) {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('Error!: ' + JSON.stringify(err))
                  .position('bottom right')
                  .hideDelay(3000)
              );
            })
        };

        ListService.getTotal('001')
          .then(function(total) {
            $scope.patientDmTotal = total;
            getDmList();
          });

        $scope.onDmPaginate = function(page, limit) {
          $scope.dmQuery.page = page;
          $scope.dmQuery.limit = limit;
          getDmList();
        };

        $scope.onHtPaginate = function(page, limit) {
          $scope.htQuery.page = page;
          $scope.htQuery.limit = limit;
          getHtList();
        };

        $scope.showDetail = function (hn) {
          $state.go('detail', {hn: hn});
        };

        $scope.doSearchDm = () => {
          let query = $scope.queryDm;

          if (!query) {
            $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('เกิดข้อผิดพลาด')
                .textContent('กรุณากรอกข้อมูลให้ครบถ้วน.')
                .ariaLabel('Alert Dialog')
                .ok('ตกลง')
            );
          } else {

            $scope.isSearching = true;
            $scope.showProgress = true;

            $scope.patientDm = [];

            ListService.getSearchList('001', query)
              .then((rows) => {
                rows.forEach(function(v) {
                  let obj = {};
                  obj.patient_hn = v.patient_hn;
                  obj.fullname = v.fullname;
                  obj.pttype_name = v.pttype_name;
                  obj.birthdate = v.birthdate;
                  obj.begin_year = v.begin_year;
                  obj.age = v.age;
                  $scope.patientDm.push(obj);
                });

                $scope.showProgress = false;
              }, (err) => {
                $log.error(err)
              })
          }
        };

        $scope.refreshDm = () => {
          ListService.getTotal('001')
            .then(function(total) {
              $scope.patientDmTotal = total;
              getDmList();
            });
        };

        $scope.doSearchHt = () => {
          let query = $scope.queryHt;

          if (!query) {
            $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('เกิดข้อผิดพลาด')
                .textContent('กรุณากรอกข้อมูลให้ครบถ้วน.')
                .ariaLabel('Alert Dialog')
                .ok('ตกลง')
            );
          } else {

            $scope.isSearchingHt = true;
            $scope.showProgress = true;

            $scope.patientHt = [];

            ListService.getSearchList('002', query)
              .then((rows) => {
                rows.forEach(function(v) {
                  let obj = {};
                  obj.patient_hn = v.patient_hn;
                  obj.fullname = v.fullname;
                  obj.pttype_name = v.pttype_name;
                  obj.birthdate = v.birthdate;
                  obj.begin_year = v.begin_year;
                  obj.age = v.age;
                  $scope.patientHt.push(obj);
                });

                $scope.showProgress = false;
              }, (err) => {
                $log.error(err)
              })
          }
        };

        $scope.refreshHt = () => {
          ListService.getTotal('002')
            .then(function(total) {
              $scope.patientHtTotal = total;
              getHtList();
            });
        };

      }


    });
})(window, window.angular);
