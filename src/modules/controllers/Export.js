(function(window, angular) {
  'use strict';

  let Finder = require('fs-finder');
  let request = require('request');

  angular.module('app.controlers.Export', ['app.services.Export'])
    .controller('ExportCtrl', function($scope, $rootScope, ExportService, ConfigService, $window, $state, $log, $mdToast, $mdDialog) {

      if (!$window.sessionStorage.getItem('logged')) {
        $state.go('login')
      }

      $scope.folder = ipcRenderer.sendSync('get-temp-path');

      $log.info($rootScope.hospitalCode);

      $scope.exportedFiles = [];

      $scope.hn = [];
      $scope.totalChronic = 0;
      $scope.totalScreen = 0;
      $scope.totalVillage = 0;
      $scope.totalDiag = 0;

      // get exported files

      let exportPath = path.join($scope.folder, 'iChronic');
      fse.ensureDirSync(exportPath);

      $scope.getFileList = () => {

        $scope.exportedFiles = [];

        var files = Finder.from(exportPath).findFiles('*.zip');
        files.forEach(function (v) {
          $scope.exportedFiles.push({
            path: v,
            name: path.basename(v)
          });
        });
      };

      $scope.getFileList();

      $scope.openFolder = function() {
        let shell = require('electron').shell;
          shell.showItemInFolder(exportPath);
      };

      $scope.doUpload = (file, idx) => {

        $scope.showProgress = true;
        let config = ConfigService.getConfig();
        //$log.info(config);
        let _fs = fs.createReadStream(file);

        let url = config.url;

        //$log.info(file);
        //
        request.post({
          url: url + '/upload',
          formData: {
            file: _fs,
            hospcode: $rootScope.hospitalCode
          }
          //formData: data
        }, (err, res, body) => {
          if (err) {
            $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('Error!')
                .textContent('ไม่สามารถอัปโหลดได้' + JSON.stringify(err))
                .ariaLabel('Alert Dialog')
                .ok('ตกลง')
            );
            $scope.showProgress = false;
          } else {

            let result = JSON.parse(body);
            if (result.ok) {
              $log.info(idx);
              fs.unlinkSync(file);
              $scope.getFileList();
              $scope.$apply();
              $mdDialog.show(
                $mdDialog.alert()
                  .parent(angular.element(document.querySelector('#popupContainer')))
                  .clickOutsideToClose(true)
                  .title('Success!')
                  .textContent('ส่งข้อมุลเสร็จเรียบร้อย')
                  .ariaLabel('Alert Dialog')
                  .ok('ตกลง')
              );

              $scope.showProgress = false;
            } else {
              $mdDialog.show(
                $mdDialog.alert()
                  .parent(angular.element(document.querySelector('#popupContainer')))
                  .clickOutsideToClose(true)
                  .title('Error!')
                  .textContent('ไม่สามารถอัปโหลดได้' + JSON.stringify(result.msg))
                  .ariaLabel('Alert Dialog')
                  .ok('ตกลง')
              );

              $scope.showProgress = false;
            }
          }
        });

      };

      $scope.doExport = function() {

        $scope.showProgress = true;

        $scope.hn = [];
        $scope.totalChronic = 0;
        $scope.totalScreen = 0;
        $scope.totalVillage = 0;
        $scope.totalDiag = 0;

        let files = {};
        files.chronic = path.join(exportPath, 'chronic.txt');
        files.village = path.join(exportPath, 'village.txt');
        files.screen = path.join(exportPath, 'screen.txt');
        files.diag = path.join(exportPath, 'diag.txt');

        fse.removeSync(files.chronic);
        fse.removeSync(files.village);
        fse.removeSync(files.screen);
        fse.removeSync(files.diag);

        let _start = moment($scope.startDate).format('YYYY-MM-DD');
        let _end = moment($scope.endDate).format('YYYY-MM-DD');

        let headers = {};

        headers.chronic = [
          'HOSPCODE', 'CID', 'PID', 'HN', 'PNAME', 'FNAME', 'LNAME', 'BIRTH', 'SEX', 'BEGIN', 'VILLAGE', 'CLINIC', 'UPDATED'
        ].join('|') + '\r\n';

        headers.diag = [
          'HOSPCODE', 'HN', 'SEQ', 'DIAGCODE', 'DIAGTYPE', 'UPDATED'
        ].join('|') + '\r\n';

        headers.village = [
          'HOSPCODE', 'VILLAGE', 'VCODE', 'NAME', 'UPDATED'
        ].join('|') + '\r\n';

        headers.screen = [
          'HOSPCODE', 'SEQ', 'HN', 'DATE_SERV', 'TIME_SERV', 'BPD', 'BPS', 'HEIGHT', 'WEIGHT',
          'TC', 'HDL', 'LDL', 'CREATININE', 'WAIST', 'SMOKING', 'DRINKING', 'UPDATED'
        ].join('|') + '\r\n';


        // write header
        fs.writeFileSync(files.chronic, headers.chronic);
        fs.writeFileSync(files.village, headers.village);
        fs.writeFileSync(files.screen, headers.screen);
        fs.writeFileSync(files.diag, headers.diag);

        let zipFile = $rootScope.hospitalCode + '-' + moment().format('YYYYMMDDHHmmss') + '.zip';
        zipFile = path.join(exportPath, zipFile);

        // Get chronic
        ExportService.getChronic()
          .then(function(rows) {

            $scope.totalChronic = rows.length;
            $scope.hn = [];

            rows.forEach(function(v) {
              $log.info(v);
              var obj = {};
              obj.HOSPCODE = v.hospcode;
              obj.CID = v.cid;
              obj.PID = v.person_id;
              obj.HN = v.patient_hn;
              obj.PNAME = v.pname;
              obj.FNAME = v.fname;
              obj.LNAME = v.lname;
              obj.BIRTH = v.birthdate;
              obj.SEX = v.sex;
              obj.BEGIN = v.begin_year;
              obj.VILLAGE = v.village_id;
              obj.CLINIC = v.clinic,
              obj.UPDATED = v.updated;

              $scope.hn.push(v.patient_hn);

              let str = [
                obj.HOSPCODE, obj.CID, obj.PID, obj.HN, obj.PNAME,
                obj.FNAME, obj.LNAME, obj.BIRTH, obj.SEX, obj.BEGIN, obj.VILLAGE, obj.CLINIC, obj.UPDATED
              ].join('|') + '\r\n';
              fs.appendFileSync(files.chronic, str);
            });

            return ExportService.getVillage();
          })
          .then(function(rows) {
            $scope.totalVillage = rows.length;

            rows.forEach(function(v) {
              //'HOSPCODE', 'VILLAGE', 'VCODE', 'NAME',  'UPDATED'
              var obj = {};
              obj.HOSPCODE = v.hospcode;
              obj.VILLAGE = v.village_id;
              obj.VCODE = v.village_code;
              obj.NAME = v.village_name;
              obj.UPDATED = v.updated;
              let str = [
                obj.HOSPCODE, obj.VILLAGE, obj.VCODE, obj.NAME, obj.UPDATED
              ].join('|') + '\r\n';
              fs.appendFileSync(files.village, str);
            });

            return ExportService.getHnService(_start, _end);
          })
          .then(function (rows) {
            let _hn = [];
            rows.forEach(function (v) {
              _hn.push(v.hn);
            });

            let __hn = _.intersection(_hn, $scope.hn);
            $scope.hn = __hn;

            return ExportService.getDiag(_start, _end, __hn);
          })
          .then((rows) => {

            $scope.totalDiag = rows.length;

            rows.forEach(function(v) {
              //'HOSPCODE', 'HN', 'SEQ', 'DIAGCODE', 'DIAGTYPE', 'UPDATED'
              var obj = {};
              obj.HOSPCODE = v.hospcode;
              obj.HN = v.hn;
              obj.SEQ = v.vn;
              obj.DIAGCODE = v.icd10;
              obj.DIAGTYPE = v.diagtype;
              obj.UPDATED = v.updated;
              let str = [
                  obj.HOSPCODE, obj.HN, obj.SEQ, obj.DIAGCODE, obj.DIAGTYPE, obj.UPDATED
                ].join('|') + '\r\n';
              fs.appendFileSync(files.diag, str);
            });

            return ExportService.getScreen(_start, _end, $scope.hn);
          })
          .then(function(rows) {
            $scope.totalScreen = rows.length;

            rows.forEach(function(v) {
              //'HOSPCODE', 'SEQ', 'HN', 'DATE_SERV',  'TIME_SERV', 'BPD', 'BPS', 'HEIGHT', 'WEIGHT',
              //'TC', 'HDL', 'LDL', 'CRETININE', 'WAIST', 'SMOKING', 'DRINKING', 'UPDATED'
              var obj = {};
              obj.HOSPCODE = v.hospcode;
              obj.SEQ = v.vn;
              obj.HN = v.hn;
              obj.DATE_SERV = v.vstdate;
              obj.TIME_SERV = v.vsttime;
              obj.BPD = v.bpd;
              obj.BPS = v.bps;
              obj.HEIGHT = v.height;
              obj.WEIGHT = v.weight;
              obj.TC = v.tc;
              obj.HDL = v.hdl;
              obj.LDL = v.ldl;
              obj.CREATININE = v.creatinine;
              obj.WAIST = v.waist;
              obj.SMOKING = v.smoking;
              obj.DRINKING = v.drinking;
              obj.UPDATED = v.updated;
              let str = [
                obj.HOSPCODE, obj.SEQ, obj.HN, obj.DATE_SERV, obj.TIME_SERV, obj.BPD, obj.BPS,
                obj.HEIGHT, obj.WEIGHT, obj.TC, obj.HDL, obj.LDL, obj.CREATININE, obj.WAIST, obj.SMOKING,
                obj.DRINKING, obj.UPDATED
              ].join('|') + '\r\n';
              fs.appendFileSync(files.screen, str);
            });
            //return ExportService.createZip(files, zipFile);
            var JSZip = require("jszip");
            var zip = new JSZip();
            zip.file("chronic.txt", fs.readFileSync(files.chronic));
            zip.file("village.txt", fs.readFileSync(files.village));
            zip.file("screen.txt", fs.readFileSync(files.screen));
            zip.file("diag.txt", fs.readFileSync(files.diag));

            var buffer = zip.generate({type:"nodebuffer"});

            fs.writeFile(zipFile, buffer, function(err) {
              if (err) {
                $scope.showProgress = false;
                $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.querySelector('#popupContainer')))
                  .clickOutsideToClose(true)
                  .title('Error!')
                  .textContent('ไม่สามารถส่งออกได้ : ' + JSON.stringify(err))
                  .ariaLabel('Alert Dialog')
                  .ok('ตกลง')
                );
              } else {
                //$scope.exportedFiles.push(path.basename(zipFile));

                $scope.showProgress = false;

                $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.querySelector('#popupContainer')))
                  .clickOutsideToClose(true)
                  .title('Success!')
                  .textContent('ส่งออกข้อมูลเสร็จเรียบร้อย')
                  .ariaLabel('Alert Dialog')
                  .ok('ตกลง')
                );
                $scope.getFileList();
              }
            });

          }, function(err) {
            $scope.showProgress = false;
            $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('Error!')
                .textContent('ไม่สามารถส่งออกได้ ' + JSON.stringify(err))
                .ariaLabel('Alert Dialog')
                .ok('ตกลง')
            );
          })
      }
    })
})(window, window.angular);
