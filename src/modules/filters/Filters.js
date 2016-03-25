'use strict';

(function (window, angular) {
  angular.module('app.filters.Filters', [])
  .filter('toThaiDate', function () {
    return function (_date) {
      let year = moment(_date).get('year') + 543;
      let month = moment(_date).get('month') + 1;
      let date = moment(_date).get('date');
      let strDate = `${date}/${month}/${year}`;

      return strDate;
    }
  })
})(window, window.angular);
