'use strict';

(function (window, angular) {
  angular.module('app.services.List', [])
  .factory('ListService', function ($q, ConfigService) {
    let db = ConfigService.getConnection();

    return {
      getHNList(clinic) {
        let q = $q.defer();
        let sql = `
        select p.patient_hn
        from clinicmember as c
        inner join person as p on p.patient_hn=c.hn
        left join house_regist_type as ht on ht.house_regist_type_id=p.house_regist_type_id
        left join clinic_member_status as cs on cs.clinic_member_status_id=c.clinic_member_status_id
        where (c.discharge <> "Y" or c.discharge is null)
        and ht.export_code in ("1", "3")
        and c.clinic=?
        and cs.provis_typedis = "03"
        `;

        db.raw(sql, [clinic])
        .then(function (rows) {
          q.resolve(rows[0])
        })
        .catch(function (err) {
          q.reject(err)
        });

        return q.promise;
      },

      getList(clinic, limit, offset) {
        let q = $q.defer();
        let sql = `
        select p.person_id, p.patient_hn, p.cid, concat(p.pname, p.fname, " ", p.lname) as fullname, p.birthdate,
        ptt.name as pttype_name, TIMESTAMPDIFF(year,p.birthdate, current_date()) as age,  c.begin_year
        from clinicmember as c
        inner join person as p on p.patient_hn=c.hn
        left join house_regist_type as ht on ht.house_regist_type_id=p.house_regist_type_id
        left join clinic_member_status as cs on cs.clinic_member_status_id=c.clinic_member_status_id
        left join pttype as ptt on ptt.pttype=p.pttype
        where (c.discharge <> "Y" or c.discharge is null)
        and ht.export_code in ("1", "3")
        and c.clinic=?
        and cs.provis_typedis = "03"
        order by p.fname, p.lname
        limit ?
        offset ?
        `;

        db.raw(sql, [clinic, limit, offset])
        .then(function (rows) {
          q.resolve(rows[0])
        })
        .catch(function (err) {
          q.reject(err)
        });

        return q.promise;
      },

      getSearchList(clinic, query) {
        let q = $q.defer();
        let sql = `
        select p.person_id, p.patient_hn, p.cid, concat(p.pname, p.fname, " ", p.lname) as fullname, p.birthdate,
        ptt.name as pttype_name, TIMESTAMPDIFF(year,p.birthdate, current_date()) as age,  c.begin_year
        from clinicmember as c
        inner join person as p on p.patient_hn=c.hn
        left join house_regist_type as ht on ht.house_regist_type_id=p.house_regist_type_id
        left join clinic_member_status as cs on cs.clinic_member_status_id=c.clinic_member_status_id
        left join pttype as ptt on ptt.pttype=p.pttype
        where (c.discharge <> "Y" or c.discharge is null)
        and ht.export_code in ("1", "3")
        and c.clinic=?
        and cs.provis_typedis = "03"
        and p.fname like ?
        order by p.fname, p.lname
        `;

        let _query = `%${query}%`;

        db.raw(sql, [clinic, _query])
        .then(function (rows) {
          q.resolve(rows[0])
        })
        .catch(function (err) {
          q.reject(err)
        });

        return q.promise;
      },

      getTotal(clinic) {
        let q = $q.defer();
        let sql = `
        select count(*) as total
        from clinicmember as c
        inner join person as p on p.patient_hn=c.hn
        left join house_regist_type as ht on ht.house_regist_type_id=p.house_regist_type_id
        left join clinic_member_status as cs on cs.clinic_member_status_id=c.clinic_member_status_id
        left join pttype as ptt on ptt.pttype=p.pttype
        where (c.discharge <> "Y" or c.discharge is null)
        and ht.export_code in ("1", "3")
        and c.clinic=?
        and cs.provis_typedis = "03"
        `;

        db.raw(sql, [clinic])
        .then(function (rows) {
          q.resolve(rows[0][0].total)
        })
        .catch(function (err) {
          q.reject(err)
        });

        return q.promise;
      }
    }

  })
})(window, window.angular);
