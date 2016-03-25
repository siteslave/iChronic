'use strict';

(function(window, angular) {
  angular.module('app.services.Calculator', [])
    .factory('CalculatorService', function($q) {

      return {
        doCalCvdRisk(age, smoke, dm, sbp, sex, tc, ldl, hdl, whr, wc) {
          let full_score = 0;
          let compare_score = 0;
          let predicted_risk = 0;
          let compare_risk = 0;
          let compare_whr = 0.52667;
          let compare_wc = 79;
          let compare_sbp = 120;
          let compare_hdl = 44;
          let sur_root = 0.978296;

          if (sex == 0) {
            compare_hdl = 49
          }
          if (sex == 1 && age > 60) {
            compare_sbp = 132
          }
          if (sex == 0 && age <= 60) {
            compare_sbp = 115
          }
          if (sex == 0 && age > 60) {
            compare_sbp = 130
          }
          if (sex == 1) {
            compare_whr = 0.58125;
            compare_wc = 93;
          }
          if (age > 1 && sbp > 50) {
            if (ldl > 0) {
              if (hdl > 0) {
                full_score = (0.08305 * age) + (0.24893 * sex) + (0.02164 * sbp) + (0.65224 * dm) + (0.00243 * ldl) + ((-0.01965) * hdl) + (0.43868 * smoke);
                predicted_risk = 1 - (Math.pow(sur_root, Math.exp(full_score - 5.9826)));
                compare_score = (0.08305 * age) + (0.24893 * sex) + (0.02164 * compare_sbp) + (0.00243 * 130) + ((-0.01965) * compare_hdl);
                compare_risk = 1 - (Math.pow(sur_root, Math.exp(compare_score - 5.9826)));
              } else {
                full_score = (0.08169 * age) + (0.35156 * sex) + (0.02084 * sbp) + (0.65052 * dm) + (0.02094 * ldl) + (0.45639 * smoke);
                predicted_risk = 1 - (Math.pow(sur_root, Math.exp(full_score - 6.99911)));
                compare_score = (0.08169 * age) + (0.35156 * sex) + (0.02084 * compare_sbp) + (0.02094 * 130);
                compare_risk = 1 - (Math.pow(sur_root, Math.exp(compare_score - 6.99911)));
              }
            } else if (tc > 0) {
              if (hdl > 0) {
                full_score = (0.083 * age) + (0.28094 * sex) + (0.02111 * sbp) + (0.69005 * dm) + (0.00214 * tc) + ((-0.02148) * hdl) + (0.40068 * smoke);
                predicted_risk = 1 - (Math.pow(sur_root, Math.exp(full_score - 6.00168)));
                compare_score = (0.083 * age) + (0.28094 * sex) + (0.02111 * compare_sbp) + (0.00214 * 200) + ((-0.02148) * compare_hdl);
                compare_risk = 1 - (Math.pow(sur_root, Math.exp(compare_score - 6.00168)));
              } else {
                full_score = (0.08183 * age) + (0.39499 * sex) + (0.02084 * sbp) + (0.69974 * dm) + (0.00212 * tc) + (0.41916 * smoke);
                predicted_risk = 1 - (Math.pow(sur_root, Math.exp(full_score - 7.04423)));
                compare_score = (0.08183 * age) + (0.39499 * sex) + (0.02084 * compare_sbp) + (0.00212 * 200);
                compare_risk = 1 - (Math.pow(sur_root, Math.exp(compare_score - 7.04423)));
              }
            } else if (whr > 0) { //ของ อ.ปริญ มีสูตรนี้สูตรเดียว
              full_score = (0.079 * age) + (0.128 * sex) + (0.019350987 * sbp) + (0.58454 * dm) + (3.512566 * whr) + (0.459 * smoke);
              predicted_risk = 1 - (Math.pow(sur_root, Math.exp(full_score - 7.720484)));
              compare_score = (0.079 * age) + (0.128 * sex) + (0.019350987 * compare_sbp) + (3.512566 * compare_whr);
              compare_risk = 1 - (Math.pow(sur_root, Math.exp(compare_score - 7.720484)));
            } else if (wc > 0) {
              full_score = (0.08372 * age) + (0.05988 * sex) + (0.02034 * sbp) + (0.59953 * dm) + (0.01283 * wc) + (0.459 * smoke);
              predicted_risk = 1 - (Math.pow(sur_root, Math.exp(full_score - 7.31047)));
              compare_score = (0.08372 * age) + (0.05988 * sex) + (0.02034 * compare_sbp) + (0.01283 * compare_wc);
              compare_risk = 1 - (Math.pow(sur_root, Math.exp(compare_score - 7.31047)));
            } else {

            }
          }

          if (predicted_risk > 0.3) {
            predicted_risk = 0.3
          }

          return [full_score, predicted_risk, compare_score, compare_risk];
        },

        doCalCkd(sex, age, cr) {
          let egfr = 0;

          if (sex == 1) { // ชาย
            if (cr <= 0.9) {
              egfr = 141 * Math.pow((cr/0.9), -0.411) * Math.pow(0.993, age);
            } else {
              egfr = 141 * Math.pow((cr/0.9), -1.209) * Math.pow(0.993, age);
            }
          } else { // หญิง
            if (cr <= 0.7) {
              egfr = 144 * Math.pow((cr/0.7), -0.329) * Math.pow(0.993, age);
            } else {
              egfr = 144 * Math.pow((cr/0.7), -1.209) * Math.pow(0.993, age);
            }
          }
          return egfr;
        }
      }
    })
})(window, window.angular)
