'use strict';

(function (window, angular) {

  angular.module('app.services.Config', [])
  .factory('ConfigService', function ($q) {
    let configFile = ipcRenderer.sendSync('get-config-file');
    let config = fse.readJsonSync(configFile);

    return {
      getConfigFile() {
        return configFile;
      },

      getConfig() {
        return config;
      },

      getConnection() {
        return require('knex')({
          client: 'mysql',
          connection: config.hosxp,
          charset: 'utf8',
          pool: {
            min: 2,
            max: 20
          }
        })
      }

    }
  })

})(window, window.angular);
