angular
.module("bodhinomad")
.controller("usersShowCtrl", usersShowCtrl);

usersShowCtrl.$inject = ["User", "$stateParams", "$state", "$http"];
function usersShowCtrl(User, $stateParams, $state, $http){
  const vm = this;

  vm.userTrades = [];
  vm.companyDetails = [];
  vm.tradesTotal = 0;
  vm.tradeDetails = [];

  User
  .query($stateParams)
  .$promise
  .then(data => {
    vm.userTrades = data;
    console.log(data)
    callServiceForEachItem(vm.userTrades);
  });

  function callServiceForEachItem(trades) {
    console.log(trades)
    var promise;
    angular.forEach(vm.userTrades, function(trade) {
      // console.log(item)
      if (!promise) {
        promise = companyDetails(trade.epic, trade.exchange, trade);
      }
    });
  }

  function companyDetails(epic, exchange, trade) {
    // console.log(epic, exchange)
    $http({
      method: 'POST',
      url: "http://localhost:3000/api/getdetails",
      data: { q: `${exchange}:${epic}` },
    }).then(function successCallback(response) {
      let tradeDetails = {
        stockprice: ${response.data[0].l_cur},
        exchange: ${response.data[0].l_cur}
        shares: ${response.data[0].l_cur}
        bookvalue: ${response.data[0].l_cur}
        currentvalue: ${response.data[0].l_cur}
        profitloss$: ${response.data[0].l_cur}
        profitloss%: ${response.data[0].l_cur}
       };
      vm.tradeDetails.push(`${epic}: {

      }`);
      console.log(vm.tradeDetails)
    });
  }
}
