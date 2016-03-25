(function(window, angular) {
  'use strict';

  angular.module('app.services.Export', [])
    .factory('ExportService', function($q, ConfigService) {
      let db = ConfigService.getConnection();

      return {
        getHnService(start, end) {
          let q = $q.defer();
          db('opdscreen')
          .distinct('hn')
          .whereBetween('vstdate', [start, end])
          .then(function (rows) {
            q.resolve(rows)
          })
          .catch(function (err) {
            q.reject(err)
          });

          return q.promise;
        },
        getChronic() {
          let q = $q.defer();
          let sql = `
        select (select hospitalcode from opdconfig limit 1) as hospcode,p.person_id,
        p.patient_hn, p.cid, p.pname, p.fname, p.lname, p.sex,
        DATE_FORMAT(p.birthdate, "%Y%m%d") as birthdate, p.village_id, c.begin_year,
        c.clinic, DATE_FORMAT(current_time(),"%Y%m%d%H%i%s") as updated
        from clinicmember as c
        inner join person as p on p.patient_hn=c.hn
        left join house_regist_type as ht on ht.house_regist_type_id=p.house_regist_type_id
        left join clinic_member_status as cs on cs.clinic_member_status_id=c.clinic_member_status_id

        where (c.discharge <> "Y" or c.discharge is null)
        and ht.export_code in ("1", "3")
        and c.clinic in ("001", "002")
        and cs.provis_typedis = "03"
        group by p.person_id
        order by p.person_id
        `;

          db.raw(sql, [])
            .then(function(rows) {
              q.resolve(rows[0])
            })
            .catch(function(err) {
              q.reject(err)
            });

          return q.promise;
        },

        getVillage() {
          let q = $q.defer();
          let sql = `
        select
        (select hospitalcode from opdconfig limit 1) as hospcode, village_id, village_code, village_name,
        DATE_FORMAT(current_time(),"%Y%m%d%H%i%s") as updated
        from village
        `;

          db.raw(sql, [])
            .then(function(rows) {
              q.resolve(rows[0])
            })
            .catch(function(err) {
              q.reject(err)
            });

          return q.promise;
        },

        getScreen(start, end, hn) {
          let q = $q.defer();
          let sql = db('opdscreen as o')
          .select(db.raw('(select hospitalcode from opdconfig limit 1) as hospcode'),
        'o.vn', 'o.hn', db.raw('DATE_FORMAT(o.vstdate,"%Y%m%d") as vstdate'), 'o.vsttime', 'o.bpd', 'o.bps',
      'o.bw as weight', 'o.height', 'o.tc', 'o.hdl', 'o.ldl', 'o.creatinine', 'o.waist', 'sm.nhso_code as smoking', 'dm.nhso_code as drinking', db.raw('DATE_FORMAT(current_time(),"%Y%m%d%H%i%s") as updated'))
        .innerJoin('person as p', 'p.patient_hn', 'o.hn')
        .leftJoin('smoking_type as sm', 'sm.smoking_type_id', 'o.smoking_type_id')
        .leftJoin('drinking_type as dm', 'dm.drinking_type_id', 'o.drinking_type_id')
        //.whereRaw(`	(o.bpd > 0 AND o.bps > 0) AND ((o.hdl > 0 AND o.ldl > 0 AND o.tc > 0) OR o.creatinine > 0)`)
        .whereBetween('o.vstdate', [start, end])
        .whereIn('o.hn', hn)
        .whereNotNull('o.vstdate')
        .whereNotNull('o.vsttime')
          .then(function(rows) {
              q.resolve(rows)
            })
            .catch(function(err) {
              q.reject(err)
            });

          return q.promise;
        },

        getDiag(start, end, hns) {
          let q = $q.defer();

          //let sql = `
          //select d.vn, d.hn, d.diagtype, d.icd10
          //from ovstdiag as d
          //where d.vstdate between "2015-01-01" and "2015-01-31"
          //and d.hn in ("0043967", "0069871", "0004311")
          //and left(d.icd10, 1) not in ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9")
          //`;

          db('ovstdiag as d')
          .select(db.raw('(select hospitalcode from opdconfig limit 1) as hospcode'), 'd.vn', 'd.hn', 'd.diagtype', 'd.icd10', db.raw('DATE_FORMAT(current_time(),"%Y%m%d%H%i%s") as updated'))
          .whereBetween('d.vstdate', [start, end])
          .whereIn('d.hn', hns)
          .whereRaw('left(d.icd10, 1) not in ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9")')
          .then((rows) => {
            q.resolve(rows)
          })
          .catch((err) => {
            q.reject(err)
          });

          return q.promise;
        },

        createZip(files, zipFile) {
          var JSZip = require("jszip");
          let q = $q.defer();
          var zip = new JSZip();
          zip.file("chronic.txt", fs.readFileSync(files.chronic));
          zip.file("village.txt", fs.readFileSync(files.village));
          zip.file("screen.txt", fs.readFileSync(files.screen));

          var buffer = zip.generate({
            type: "nodebuffer"
          });

          fs.writeFile(zipFile, buffer, function(err) {
            if (err) q.resolve();
            else q.reject(err);
          });

          return q.promise;
        }
      }
    })
})(window, window.angular);
