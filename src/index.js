'use strict';

const ipcRenderer = require('electron').ipcRenderer;
const fse = require('fs-extra');
const moment = require('moment');
const Highcharts = require('highcharts');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

require('angular');
require('angular-animate');
require('angular-aria');
require('angular-material');
require('angular-ui-router');
require('angular-material-data-table');
//
// Highcharts.setOptions({
//     lang: {
//         decimalPoint: '.',
//         thousandsSep: ','
//     },
//
//     tooltip: {
//         yDecimals: 2 // If you want to add 2 decimals
//     }
// });

angular.module('app', [
    'ngMaterial', 'ui.router', 'highcharts-ng',
    'md.data.table', 'app.services.Config', 'app.controllers.Connection',
    'app.controllers.List', 'app.filters.Filters', 'app.controllers.Detail',
    'app.controlers.Export', 'app.controllers.Main', 'app.controllers.Report',
    'app.controllers.StateView', 'app.controllers.Login'
  ])
  .run(function($rootScope) {

  })
  .config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: './templates/Main.html',
        controller: 'MainCtrl'
      })
      .state('login', {
        url: '/login',
        templateUrl: './templates/Login.html',
        controller: 'LoginCtrl'
      })
      .state('list', {
        url: '/list',
        templateUrl: './templates/List.html',
        controller: 'ListCtrl'
      })
      .state('detail', {
        url: '/detail/:hn/:dm',
        templateUrl: './templates/Detail.html',
        controller: 'DetailCtrl'
      })
      .state('connection', {
        url: '/connection',
        templateUrl: './templates/Connection.html',
        controller: 'ConnectionCtrl'
      })
      .state('export', {
        url: '/export',
        templateUrl: './templates/Export.html',
        controller: 'ExportCtrl'
      })
        .state('report', {
        url: '/report',
        templateUrl: './templates/Report.html',
        controller: 'ReportCtrl'
      })
      .state('state-view', {
        url: '/state-view/:state/:type/:start/:end',
        templateUrl: './templates/StateView.html',
        controller: 'StateViewCtrl'
      })
  })
  .controller('AppCtrl', function($scope, $mdSidenav, $state) {
    $scope.toggleLeft = function() {
      $mdSidenav('left')
        .toggle()
    };

    $scope.go = function(state) {
      $state.go(state);
    }

  })
  .controller('NavCtrl', function($scope, $rootScope, $timeout, $mdSidenav, $log, ConfigService) {
    $scope.toggleLeft = function() {
      $mdSidenav('left')
        .toggle()
    };

  })
  .controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function() {
      $mdSidenav('left').close()
        .then(function() {
          $log.debug("close LEFT is done");
        });
    };
  });
