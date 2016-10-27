angular
.module("bodhinomad")
.controller("companiesIndexCtrl", companiesIndexCtrl);

companiesIndexCtrl.$inject = ["$http", "API"];
function companiesIndexCtrl($http, API) {
  const vm = this;

  vm.company = [];

  // vm.getTradeComments = () => {
    $http({
      method: 'GET',
      url: `${API}/trades`,
    }).then(function successCallback(response) {
      vm.company.trades = response.data;
      // console.log(response.data)
    }, function errorCallback(response) {
      vm.error = response;
    });
  // };


}
