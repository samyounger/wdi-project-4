angular
.module("bodhinomad")
.controller("usersShowCtrl", usersShowCtrl);

usersShowCtrl.$inject = ["User", "$stateParams", "$state", "$http"];
function usersShowCtrl(User, $stateParams, $state, $http){
  const vm = this;

  vm.userTrades = [];
  vm.companyDetails = [];

  User
  .query($stateParams)
  .$promise
  .then(data => {
    vm.userTrades = data[0].trades;
    userTradesLoop(vm.userTrades);
  });

  // Iterate over userTrades running get request to google finance for current price
  function userTradesLoop(trades) {
    for(let i = 0; i < trades.length; i++) {
      companyDetails(vm.userTrades[i].epic, vm.userTrades[i].exchange);
    }
  }

  function companyDetails(epic, exchange) {
    $http({
      method: 'POST',
      url: "http://localhost:3000/api/getdetails",
      data: { q: `${exchange}:${epic}` },
    }).then(function successCallback(response) {
      vm.companyDetails = [];
      vm.companyDetails.push(response.data);
    });
  }
}
