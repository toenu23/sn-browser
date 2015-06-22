(function() {

  var app = angular.module('NRSClient', ['Ceres']);

  /*
   * NRS controller
   */
  var nrsController = function($scope, $sce, module) {

    module.ready(function() {

      var url = '';
      url += module.opts.nrs.protocol;
      url += '//';
      url += module.opts.nrs.host;
      url += '?account=';
      url += module.opts.account;

      $scope.nrsUrl = $sce.trustAsResourceUrl(url);
      $scope.$apply();
    });
  };

  app.controller('NRSCtrl', ['$scope', '$sce', 'CeresModule', nrsController]);

})();
