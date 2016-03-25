(function (window, angular) {

  'use strict';
  
  angular.module('app.services.StateView', [])
  .factory('StateViewService', function ($q, ConfigService) {
    let db = ConfigService.getConnection();

    return {
      getCvd(start, end, hns) {
        let q = $q.defer();
        db('opdscreen as o1')
            .select('v.village_code', 'v.village_name', 'v.village_moo', 'p.pname', 'p.fname', 'p.lname',
                'o1.hn', 'o1.vstdate', 'o1.bps as sbp', 'o1.bw as weight', 'o1.waist',
                'o1.height', 'o1.tc', 'o1.hdl', 'o1.ldl',
                db.raw('if(sm.nhso_code is null, 1, sm.nhso_code) as smoking'),
                db.raw('TIMESTAMPDIFF(YEAR,p.birthdate,o1.vstdate) as age'), 'cm.clinic'
            )
            .innerJoin('person as p', 'p.patient_hn', 'o1.hn')
            .innerJoin('village as v', 'v.village_id', 'p.village_id')
            .leftJoin('smoking_type as sm', 'sm.smoking_type_id', 'o1.smoking_type_id')
            .leftJoin('drinking_type as dm', 'dm.drinking_type_id', 'o1.drinking_type_id')
            .leftJoin('clinicmember as cm', 'cm.hn', 'p.patient_hn')

            .whereRaw(`
                    o1.vstdate = (
                        select max(o2.vstdate)
                        from opdscreen as o2
                        where o2.hn=o1.hn
                        and o2.bps > 0
                        and o2.tc > 0
                        and o2.hdl > 0
                    and o2.ldl > 0
                    )
                `)
            .whereIn('o1.hn', hns)
            .whereBetween('o1.vstdate', [start, end])
            .groupBy('o1.hn')
            .orderBy('v.village_moo')
            .then((rows) => {
              q.resolve(rows)
            })
            .catch((err) => {
              q.reject(err)
            });

        return q.promise;
      },

      getCkd(start, end, hns) {

          let q = $q.defer();

          db('opdscreen as o1')
              .select('o1.hn', 'o1.vstdate', 'o1.creatinine', 'v.village_code', 'v.village_name', 'v.village_moo', 'p.pname', 'p.fname', 'p.lname',
                  db.raw('TIMESTAMPDIFF(YEAR,p.birthdate,o1.vstdate) as age'),
                  db.raw(`
                 case
when p.sex='1' and o1.creatinine <= 0.9 then
	case
		when (141 * pow((o1.creatinine/0.9), -0.411) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) >= 90 then 1
		when (141 * pow((o1.creatinine/0.9), -0.411) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 60 and 89 then 2
		when (141 * pow((o1.creatinine/0.9), -0.411) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 30 and 59 then 3
		when (141 * pow((o1.creatinine/0.9), -0.411) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 15 and 29 then 4
		when (141 * pow((o1.creatinine/0.9), -0.411) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) < 15 then 5
	end
when p.sex='1' and o1.creatinine > 0.9 then
		case
		when (141 * pow((o1.creatinine/0.9), -1.209) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) >= 90 then 1
		when (141 * pow((o1.creatinine/0.9), -1.209) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 60 and 89 then 2
		when (141 * pow((o1.creatinine/0.9), -1.209) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 30 and 59 then 3
		when (141 * pow((o1.creatinine/0.9), -1.209) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 15 and 29 then 4
		when (141 * pow((o1.creatinine/0.9), -1.209) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) < 15 then 5
		end
when p.sex='2' and o1.creatinine <= 0.7 then
		case
		when (144 * pow((o1.creatinine/0.7), -0.392) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) >= 90 then 1
		when (144 * pow((o1.creatinine/0.7), -0.392) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 60 and 89 then 2
		when (144 * pow((o1.creatinine/0.7), -0.392) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 30 and 59 then 3
		when (144 * pow((o1.creatinine/0.7), -0.392) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 15 and 29 then 4
		when (144 * pow((o1.creatinine/0.7), -0.392) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) < 15 then 5
		end
when p.sex='2' and o1.creatinine > 0.7 then
		case
		when (144 * pow((o1.creatinine/0.7), -1.209) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) >= 90 then 1
		when (144 * pow((o1.creatinine/0.7), -1.209) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 60 and 89 then 2
		when (144 * pow((o1.creatinine/0.7), -1.209) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 30 and 59 then 3
		when (144 * pow((o1.creatinine/0.7), -1.209) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) between 15 and 29 then 4
		when (144 * pow((o1.creatinine/0.7), -1.209) * pow(0.993, TIMESTAMPDIFF(year,p.birthdate,o1.vstdate))) < 15 then 5
		end
end as state
                    `))
              .innerJoin('person as p', 'p.patient_hn', 'o1.hn')
              .innerJoin('village as v', 'v.village_id', 'p.village_id')
              .innerJoin('clinicmember as c', 'c.hn', 'p.patient_hn')
              .leftJoin('house_regist_type as ht', 'ht.house_regist_type_id', 'p.house_regist_type_id')
              .leftJoin('clinic_member_status as cs', 'cs.clinic_member_status_id', 'c.clinic_member_status_id')
              .whereRaw(`o1.vstdate = (
                    select max(o2.vstdate)
                    from opdscreen as o2
                    where o2.hn=o1.hn
                    and o2.creatinine>0
                )`)
              .where('c.discharge', '<>', "Y")
              .whereIn('ht.export_code', ["1", "3"])
              .whereIn('c.clinic', ["001", "002"])
              .where('cs.provis_typedis', "03")
              .whereBetween('o1.vstdate', [start, end])
              .whereIn('o1.hn', hns)
              //.whereIn('v.village_code', villages)
              .groupBy('o1.hn')
              .then((rows) => {
                  q.resolve(rows)
              })
              .catch((err) => {
                  q.reject(err)
              });

          return q.promise;
      }
    }
  })
})(window, window.angular);
