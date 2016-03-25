'use strict';

(function (window, angular) {
  angular.module('app.controllers.Detail', ['app.services.Detail', 'app.services.Calculator'])
  .controller('DetailCtrl', function ($scope, $log, $stateParams, $filter, $window, $state, DetailService, CalculatorService) {

    if (!$window.sessionStorage.getItem('logged')) {
      $state.go('login')
    }

    let hn = $stateParams.hn;
    let isDm = $stateParams.type == 1 ? 1 : 0;

    $scope.cvdHistory = [];
    $scope.ckdHistory = [];

    $scope.chartConfigCkd = {
      options: {
           chart: {
               type: 'line'
           }
       },
       xAxis: {
           categories: [],
           labels: {
                rotation: -45
            }
       },
       yAxis: {
            title: {
                text: 'ระดับความเสี่ยง'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
       series: [{
         name: 'eGFR',
           data: []
       }],
       title: {
           text: 'ผล CKD ล่าสุด'
       },
       loading: false,
       size: {
         height: 250,
         width: 460
       }
    };

    $scope.chartConfigCvd = {
      options: {
           chart: {
               type: 'line'
           }
       },
       xAxis: {
           categories: [],
           labels: {
                rotation: -45
            }
       },
       yAxis: {

         labels: {
        formatter: function () {
            return Highcharts.numberFormat(this.value, 0);
        }
    },

            title: {
                text: 'ระดับความเสี่ยง'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
       series: [{
         name: 'Score',
           data: []
       }],
       title: {
           text: 'ผล CVD ล่าสุด'
       },
       loading: false,
       size: {
         height: 250,
         width: 460
       }
    };

    // Get person info
    DetailService.getInfo(hn)
    .then(function (person) {
      console.log(person);
      $scope.person = person;
    }, function (err) {
      console.log(err);
    });

    // Get ckd history
    DetailService.getCkdHistory(hn)
    .then(function (rows) {
      rows.forEach(function (v) {
        let obj = {};
        obj.vstdate = v.vstdate;
        obj.vsttime = v.vsttime;
        obj.creatinine = v.creatinine;
        obj.age = v.age;
        obj.sex = v.sex;
        obj.timestamp = moment(v.vstdate).format('x');

        obj.egfr = CalculatorService.doCalCkd(obj.sex, obj.age, obj.creatinine);
          //
          //when (141 * pow((o.creatinine/0.9), -0.411) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o.vstdate))) >= 90 then 1
          //when (141 * pow((o.creatinine/0.9), -0.411) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o.vstdate))) between 60 and 89 then 2
          //when (141 * pow((o.creatinine/0.9), -0.411) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o.vstdate))) between 30 and 59 then 3
          //when (141 * pow((o.creatinine/0.9), -0.411) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o.vstdate))) between 15 and 29 then 4
          //when (141 * pow((o.creatinine/0.9), -0.411) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o.vstdate))) < 15 then 5
        if (obj.egfr >= 90) {
            obj.state = 1
        } else if (obj.egfr >= 60 && obj.egfr <= 89) {
            obj.state = 2
        } else if (obj.egfr >= 30 && obj.egfr <= 59) {
            obj.state = 3
        } else if (obj.egfr >= 15 && obj.egfr <= 29) {
            obj.state = 4
        } else if (obj.egfr < 15) {
            obj.state = 5
        }
          $scope.ckdHistory.push(obj);
      });

      let data = _.orderBy($scope.ckdHistory, ['timestamp'], ['asc']);
      data.forEach(function (v) {
          let thaiDate = $filter('toThaiDate')(v.vstdate);
          $scope.chartConfigCkd.xAxis.categories.push(thaiDate);
          $scope.chartConfigCkd.series[0].data.push(v.egfr);
      });

    }, function (err) {
      console.log(err);
    });

    // Get ckd history
    DetailService.getCvdHistory(hn)
    .then(function (rows) {
      //console.log(rows);

      //console.log(data);
      rows.forEach(function (v) {
        let obj = {};
        obj.vstdate = v.vstdate;
        obj.vsttime = v.vsttime;
        obj.bps = v.bps;
        obj.smoke = v.smoking == 0 ? 'ไม่สูบ' : 'สูบ';
        obj.tc = v.tc;
        obj.ldl = v.ldl;
        obj.hdl = v.hdl;

        let data = {};
        data.age = v.age;
        data.sex = v.sex == 1 ? 0 : 1;
        data.smoke = v.smoking == 0 ? 0 : 1;
        data.whr = 0;
        data.wc = v.waist * 2.5;
        data.sbp = v.bps;
        data.tc = v.tc;
        data.ldl = v.ldl;
        data.hdl = v.hdl;
        data.dm = v.clinic == '001' ? 1 : 0;

        if (v.waist > 0 && v.height > 0) { data.whr = data.wc / v.height }
        // doCalCvdRisk(age, smoke, dm, sbp, sex, tc, ldl, hdl, whr, wc)

        let result = CalculatorService.doCalCvdRisk(data.age, data.smoke, data.dm, data.sbp, data.sex, data.tc, data.ldl, data.hdl, data.whr, data.wc);
        obj.score = result[1] * 100;
        //let risk = obj.risk;

      if (obj.score < 10) {
          obj.state = 'ต่ำ';
      } else if (obj.score >= 10 && obj.score < 20) {
          obj.state = 'ปานกลาง';
      } else if (obj.score >= 20 && obj.score < 30) {
          obj.state = 'สูง';
      } else if (obj.score >= 30 && obj.score < 40) {
          obj.state = 'สูงมาก';
      } else if (obj.score >= 40) {
          obj.state = 'สูงอันตราย';
      }

        obj.timestamp = moment(v.vstdate).format('x');
        $log.info(obj);
        $scope.cvdHistory.push(obj);

      });

      let data = _.orderBy($scope.cvdHistory, ['timestamp'], ['asc']);
      data.forEach(function (v) {
          let thaiDate = $filter('toThaiDate')(v.vstdate);
          $scope.chartConfigCvd.xAxis.categories.push(thaiDate);
          $scope.chartConfigCvd.series[0].data.push(v.score);
      });
    }, function (err) {
      console.log(err);
    });



  })
})(window, window.angular);
