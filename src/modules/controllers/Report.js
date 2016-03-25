((window, angular) => {
    "use strict";
    angular.module('app.controllers.Report', ['app.services.Report', 'app.services.List', 'app.services.Calculator'])
    .controller('ReportCtrl', ($scope, $rootScope, $state, ReportService, $window, ListService, CalculatorService, $log, $mdToast) => {

      if (!$window.sessionStorage.getItem('logged')) {
        $state.go('login')
      }

        $scope.villages = [];
        $scope.villages_codes = [];
        $scope.hns = [];

        $rootScope.patientCVDState = {};
        $rootScope.patientCVDState.state1 = [];
        $rootScope.patientCVDState.state2 = [];
        $rootScope.patientCVDState.state3 = [];
        $rootScope.patientCVDState.state4 = [];
        $rootScope.patientCVDState.state5 = [];

        $rootScope.patientCKDState = {};
        $rootScope.patientCKDState.state1 = [];
        $rootScope.patientCKDState.state2 = [];
        $rootScope.patientCKDState.state3 = [];
        $rootScope.patientCKDState.state4 = [];
        $rootScope.patientCKDState.state5 = [];

        $scope.totalCKDState1 = 0;
        $scope.totalCKDState2 = 0;
        $scope.totalCKDState3 = 0;
        $scope.totalCKDState4 = 0;
        $scope.totalCKDState5 = 0;

        $scope.totalCVDState1 = 0;
        $scope.totalCVDState2 = 0;
        $scope.totalCVDState3 = 0;
        $scope.totalCVDState4 = 0;
        $scope.totalCVDState5 = 0;

        $scope.startDate = new Date(moment().startOf('month').utc().format());
        $scope.endDate = new Date(moment().endOf('month').utc().format());


        $scope.getCkd = () => {
            $scope.showProgress = true;

            let _start = moment($scope.startDate).format('YYYY-MM-DD');
            let _end = moment($scope.endDate).format('YYYY-MM-DD');

            $scope.villages = [];
            $scope.villages_codes = [];

            ReportService.getVillage()
                .then((villages) => {
                    villages.forEach((v) => {
                        $scope.villages.push({
                            code: v.village_code,
                            name: v.village_name,
                            ckd_state1: 0,
                            ckd_state2: 0,
                            ckd_state3: 0,
                            ckd_state4: 0,
                            ckd_state5: 0,
                            cvd_state1: 0,
                            cvd_state2: 0,
                            cvd_state3: 0,
                            cvd_state4: 0,
                            cvd_state5: 0
                        });

                        //$scope.villages_codes.push(v.village_code);
                    });

                    //$log.info($scope.villages);
                    return ListService.getHNList('002')

                })
                .then((rows) => {
                    $scope.hns = [];
                    rows.forEach((v) => {
                        $scope.hns.push(v.patient_hn)
                    });

                    return ReportService.getCkd(_start, _end,  $scope.hns);
                })
                .then((rows) => {
                    $scope.villages.forEach((v) => {
                        rows.forEach((x) => {
                            if (x.village_code == v.code) {
                                if (x.state == 1) {
                                    v.ckd_state1++;
                                    $rootScope.patientCKDState.state1.push(x.hn);
                                    $scope.totalCKDState1++;
                                } else if (x.state == 2) {
                                    v.ckd_state2++;
                                    $scope.totalCKDState2++;
                                    $rootScope.patientCKDState.state2.push(x.hn);
                                } else if (x.state == 3) {
                                    v.ckd_state3++;
                                    $scope.totalCKDState3++;
                                    $rootScope.patientCKDState.state3.push(x.hn);
                                } else if (x.state == 4) {
                                    v.ckd_state4++;
                                    $scope.totalCKDState4++;
                                    $rootScope.patientCKDState.state4.push(x.hn);
                                } else if (x.state == 5) {
                                    v.ckd_state5++;
                                    $scope.totalCKDState5++;
                                    $rootScope.patientCKDState.state5.push(x.hn);
                                }
                            }
                        });
                    });

                    $log.info($scope.hns);
                    return ReportService.getCvd(_start, _end, $scope.hns);
                })
                .then((rows) => {
                    $scope.villages.forEach((v) => {
                        rows.forEach((x) => {
                            if (x.village_code == v.code) {
                                let data = {};
                                data.age = x.age;
                                data.sex = x.sex == 1 ? 0 : 1;
                                data.smoke = x.smoking == 0 ? 0 : 1;
                                data.whr = 0;
                                data.wc = x.waist * 2.5;
                                data.sbp = x.sbp;
                                data.tc = x.tc;
                                data.ldl = x.ldl;
                                data.hdl = x.hdl;
                                data.dm = x.clinic == "001" ? 1 : 0;

                                if (x.waist > 0 && x.height > 0) { data.whr = data.wc / x.height }

                                let result = CalculatorService.doCalCvdRisk(data.age, data.smoke, data.dm, data.sbp, data.sex, data.tc, data.ldl, data.hdl, data.whr, data.wc);
                                let _state = result[1] * 100;
                                //$log.info(data);
                                //$log.info(result);
                                if (_state < 10) {
                                    v.cvd_state1++;
                                    $scope.totalCVDState1++;
                                    $rootScope.patientCVDState.state1.push(x.hn);
                                } else if (_state >= 10 && _state < 20) {
                                    v.cvd_state2++;
                                    $scope.totalCVDState2++;
                                    $rootScope.patientCVDState.state2.push(x.hn);
                                } else if (_state >= 20 && _state < 30) {
                                    v.cvd_state3++;
                                    $scope.totalCVDState3++;
                                    $rootScope.patientCVDState.state3.push(x.hn);
                                } else if (_state >= 30 && _state < 40) {
                                    v.cvd_state4++;
                                    $scope.totalCVDState4++;
                                    $rootScope.patientCVDState.state4.push(x.hn);
                                } else if (_state >= 40) {
                                    v.cvd_state5++;
                                    $scope.totalCVDState5++;
                                    $rootScope.patientCVDState.state5.push(x.hn);
                                }
                            }
                        });
                    });

                    //$log.info($rootScope.patientCKDState);
                    //$log.info($rootScope.patientCVDState);
                    $scope.showProgress = false;
                }, (err) => {
                    $scope.showProgress = false;
                    $log.error(err);
                });
        };


        $scope.exportToExcel = () => {

            let json2xls = require('json2xls');
            let open = require('open');

          if ($scope.villages.length) {
            let exportPath = ipcRenderer.sendSync('get-export-path');
            fse.ensureDirSync(exportPath);

            let file = moment().format('x') + '.xls';
            let exportFile = path.join(exportPath, file);
            let xls = json2xls($scope.villages);

            fs.writeFileSync(exportFile, xls, 'binary');
            open(exportFile);
          } else {
            $mdToast.show(
              $mdToast.simple()
                .textContent('ไม่พบรายการที่ต้องการส่งออก')
                .position('bottom right')
                .hideDelay(3000)
            );
          }

        };

        $scope.goStateView = (state, type) => {
            let _start = moment($scope.startDate).format('YYYY-MM-DD');
            let _end = moment($scope.endDate).format('YYYY-MM-DD');
            $state.go('state-view', {state: state, type: type, start: _start, end: _end})
        }
    });
})(window, window.angular);