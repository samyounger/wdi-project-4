angular
.module("bodhinomad")
.controller("usersShowCtrl", usersShowCtrl);

usersShowCtrl.$inject = ["User", "$stateParams", "$http", "API", "$state", "CurrentUserService", "Trade"];
function usersShowCtrl(User, $stateParams, $http, API, $state, CurrentUserService, Trade){
  const vm = this;

  User
  .get($stateParams).$promise
  .then(user => {
    vm.user = user;
    vm.user.totalDollarProfit = 0;
    user.trades.forEach((trade, index) => getLivePrice(trade, index));
  });

  vm.tradeStock = (trade) => {
    document.getElementById("container").style.height="200px";
    vm.trade = trade;
    getLivePrice(trade);
    vm.getData();
    vm.trade.trade_type = "sell";
    vm.trade.sale_value = vm.trade.currentPrice * vm.trade.number_of_shares;
  };

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
      if(vm.trade) vm.trade.currentPrice = parseFloat(response.data[0].l_cur);
      trade.currentValue     = trade.currentPrice * trade.number_of_shares;
      trade.dollarProfit     = Math.floor((trade.currentValue - trade.book_value) * 100)/100;
      trade.percentageProfit = Number((trade.currentValue/trade.book_value)-1).toFixed(2);
      // update user's trade with augmented trade object
      vm.user.trades[index] = trade;
      // Increment profit
      vm.user.totalDollarProfit += trade.dollarProfit;
    }, function errorCallback(response) {
      vm.error = response;
    });
  }


  vm.getData = function(){
    event.preventDefault();
    return $http({
      method: 'GET',
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${vm.trade.epic}.json?api_key=s5sWLyV147fDnD7YssxU`
    }).then(function successCallback(response) {
      vm.trade.dataset = response.data.dataset;
      sortChartData();
    }, function errorCallback(response) {
      vm.error = response;
    });
  };


  /*
   * Sorting Quandl data for use in Highcharts
   * - Create chart at the end
   */
  function sortChartData() {
    vm.trade.dateInformation  = [];
    vm.trade.priceInformation = [];

    for (var i = vm.trade.dataset.data.length-1; i >= 0; i--) {
      vm.trade.dateInformation.push(vm.trade.dataset.data[i][0]);
      vm.trade.priceInformation.push(vm.trade.dataset.data[i][11]);
    }
    return prepareChart();
  }

  function prepareChart() {
    var chart = new Highcharts.Chart({
      chart: {
        renderTo: 'container',
        type: 'line',
        height: 200,
      },
      title: {
        text: "",
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Date'
        },
        dateTimeLabelFormats: {
           day: '%d %b %Y'
        }
      },
      yAxis: {
        title: {
          text: 'Price (USD)'
        }
      },
      series: [{
        name: vm.trade.epic,
        showInLegend: false,
        data: vm.trade.priceInformation
      }]
    });
  }

  vm.submitSellTrade = () => {
    Trade
      .save({ trade: vm.trade })
      .$promise
      .then(data => {
        $("#myModal").modal("hide");
        User
        .get($stateParams).$promise
        .then(user => {
          vm.user = user;
          vm.user.totalDollarProfit = 0;
          user.trades.forEach((trade, index) => getLivePrice(trade, index));
        });

        // Want to reload page to see new trades. or 'push' data to end of table?
      })
      .catch(response => {
        console.log(response);
      });
  };
}
