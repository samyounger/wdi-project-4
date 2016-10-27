angular
.module("bodhinomad")
.controller("companiesIndexCtrl", companiesIndexCtrl);

companiesIndexCtrl.$inject = ["CurrentUserService", "User", "$stateParams", "$http", "API", "$state"];
function companiesIndexCtrl(CurrentUserService, User, $stateParams, $http, API, $state, Trade){
  const vm = this;

  User
  .get({id: CurrentUserService.getUser().id})
  .$promise
  .then(user => {
    console.log(user);
    vm.user = user;
    vm.user.totalDollarProfit = 0;
    vm.user.totalPortfolioValue = 0;
    user.trades.forEach((trade, index) => getLivePrice(trade, index));
    user.trades_by_epic.forEach((trade, index) => getLivePrice(trade, index));
  });

  vm.tradeStock = (trade) => {
    document.getElementById("container").style.height="200px";
    vm.trade = trade;
    getLivePrice(trade);
  };

  function getLivePrice(trade, index){
    console.log("yup");
    $http({
      method: 'POST',
      url: `${API}/getdetails`,
      data: {
        q: `${trade.exchange}:${trade.epic}`
      },
    })
    .then(function successCallback(response) {
      console.log(response);
      trade.currentPrice     = parseFloat(response.data[0].l_cur);
      if(vm.trade) vm.trade.currentPrice = parseFloat(response.data[0].l_cur);
      trade.currentValue     = trade.currentPrice * trade.number_of_shares;
      trade.dollarProfit     = Math.floor((trade.currentValue - trade.book_value) * 100)/100;
      trade.percentageProfit = Number((trade.currentValue/trade.book_value)-1).toFixed(2);
      // update user's trade with augmented trade object
      vm.user.trades[index] = trade;
      // Increment profit
      vm.user.totalDollarProfit += trade.dollarProfit;
      vm.user.totalPortfolioValue += trade.currentValue;
    }, function errorCallback(response) {
      vm.error = response;
    });
  }

}
