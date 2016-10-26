angular
.module("bodhinomad")
.controller("usersShowCtrl", usersShowCtrl);

usersShowCtrl.$inject = ["User", "$stateParams", "$http", "API"];
function usersShowCtrl(User, $stateParams, $http, API){
  const vm = this;

  User
    .get($stateParams).$promise
    .then(user => {
      vm.user = user;
      vm.user.totalDollarProfit = 0;
      user.trades.forEach((trade, index) => getLivePrice(trade, index));
    });

  function getLivePrice(trade, index){
    $http({
      method: 'POST',
      url: `${API}/getdetails`,
      data: {
        q: `${trade.exchange}:${trade.epic}`
      },
    })
    .then(function successCallback(response) {
      trade.currentPrice     = parseFloat(response.data[0].l_cur);
      trade.currentValue     = trade.currentPrice * trade.number_of_shares;
      trade.dollarProfit     = trade.currentValue - trade.value;
      trade.percentageProfit = (trade.currentValue/trade.value)-1;
      // update user's trade with augmented trade object
      vm.user.trades[index] = trade;
      // Increment profit
      vm.user.totalDollarProfit += trade.dollarProfit;
    }, function errorCallback(response) {
      vm.error = response;
    });
  }
}
