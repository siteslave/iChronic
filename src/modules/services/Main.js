(function (window, angular) {

  'use strict';
  
  angular.module('app.services.Main', [])
  .factory('MainService', function ($q, ConfigService) {
    let db = ConfigService.getConnection();

    return {
      getHospital() {
        let q = $q.defer();

        db('opdconfig')
        .select('hospitalname', 'hospitalcode')
        .limit(1)
        .then(function (rows) {
          q.resolve(rows[0])
        }, function (err) {
          q.reject(err)
        });

        return q.promise;
      }
    }
  })
})(window, window.angular)
