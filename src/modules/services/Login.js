((window, angular) => {
  "use strict";
  angular.module('app.services.Login', [])
  .factory('LoginService', ($q, $http, ConfigService) => {

    let config = ConfigService.getConfig();
    let url = config.url;
    let key = config.key;

    return {
      doLogin(username, password) {
        let q = $q.defer();

        let options = {
          url: url + '/users/login',
          method: 'POST',
          data: {
            username: username,
            password: password,
            key: key
          }
        };

        $http(options)
        .success((res) => {
          q.resolve(res)
        })
        .error(() => {
          q.reject('Connection error!')
        });

        return q.promise;
      }
    }
  })
})(window, window.angular);