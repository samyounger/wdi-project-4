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
    user.trades_by_epic.forEach((trade, index) => getLivePrice(trade, index));
  });

  vm.tradeStock = (trade) => {
    document.getElementById("container").style.height="200px";
    vm.trade = trade
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
      trade.currentValue     = parseFloat(trade.currentPrice * trade.number_of_shares).toFixed(2);
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
    vm.dataLoading = true;
    return $http({
      method: 'GET',
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${vm.trade.epic}.json?api_key=s5sWLyV147fDnD7YssxU`
    }).then(function successCallback(response) {
      vm.dataLoading = false;
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
    vm.chart = new Highcharts.Chart({
      chart: {
        loading: true,
        renderTo: 'container',
        type: 'line',
        height: 200,
        zoomType: 'x'
      },
      title: {
        text: "",
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            ]
          },
          marker: {
            radius: 2
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1
            }
          },
          threshold: null
        }
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
      legend: {
        enabled: false
      },
      series: [{
        type: 'area',
        name: vm.trade.epic,
        data: vm.trade.priceInformation,
        tooltip: {
          valueDecimals: 2
        }
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
