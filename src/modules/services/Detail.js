'use strict';

(function(window, angular) {
  angular.module('app.services.Detail', [])
    .factory('DetailService', function($q, ConfigService) {
      let db = ConfigService.getConnection();

      return {
        getInfo(hn) {
          let q = $q.defer();
          let sql = `
          select p.patient_hn, p.person_id, concat(p.pname, p.fname, " ", p.lname) as fullname, p.birthdate,
          TIMESTAMPDIFF(YEAR, p.birthdate, current_date()) as age
          from person as p
          where p.patient_hn=?
          `;

          db.raw(sql, [hn])
          .then(function (rows) {
            q.resolve(rows[0][0])
          })
          .catch(function (err) {
            q.reject(err)
          });

          return q.promise;
        },
        getCvdHistory(hn) {
          let q = $q.defer();

          let sql = `
          select o.vn, o.hn, p.sex, o.vstdate, o.vsttime, o.bpd, o.bps, o.bw as weight, o.height, o.tc, o.hdl, o.ldl, o.creatinine, o.cholesterol, o.waist,
          sm.nhso_code as smoking, TIMESTAMPDIFF(YEAR,p.birthdate,o.vstdate) as age, cm.clinic
          from opdscreen as o
          inner join person as p on p.patient_hn=o.hn
          left join smoking_type as sm on sm.smoking_type_id=o.smoking_type_id
          left join clinicmember as cm on cm.hn=p.patient_hn
          where (o.bpd is not null or o.bps is not null)
          and o.hdl>0 and o.ldl>0 and o.tc>0
          and o.hn=?
          group by o.hn, o.vstdate
          order by o.vstdate  desc
          limit 10
          `;
          db.raw(sql, [hn])
          .then(function (rows) {
            q.resolve(rows[0])
          })
          .catch(function (err) {
            q.reject(err)
          });

          return q.promise;
        },
        getCkdHistory(hn) {
          let q = $q.defer();

          let sql = `
          select o.vn, o.hn, p.sex, o.vstdate, o.vsttime, o.creatinine,
          o.smoking_type_id, o.drinking_type_id, TIMESTAMPDIFF(YEAR,p.birthdate,o.vstdate) as age
          from opdscreen as o
          inner join person as p on p.patient_hn=o.hn
          where (smoking_type_id is not null or drinking_type_id is not null)
          and (o.creatinine is not null and o.creatinine>0)
          and o.hn=?
          group by o.hn, o.vstdate
          order by o.vstdate  desc
          limit 10
          `;
          db.raw(sql, [hn])
          .then(function (rows) {
            q.resolve(rows[0])
          })
          .catch(function (err) {
            q.reject(err)
          });

          return q.promise;
        }
      }
    })
})(window, window.angular);
