angular
.module("bodhinomad")
.controller("companiesNewCtrl", companiesNewCtrl);

companiesNewCtrl.$inject = ["Trade", "$http", "$resource", "CurrentUserService", "API", "$state", "$scope", "$timeout", "moment"];
function companiesNewCtrl(Trade, $http, $resource, CurrentUserService, API, $state, $scope, $timeout, moment) {
  const vm = this;

  vm.trade = {
    trade_type: "buy"
  };

  let debounce = null;

  vm.getCompany = function(val){
    $timeout.cancel(debounce);
      return debounce = $timeout(function() {
        return $http({
          method: 'POST',
          url: `${API}/company`,
          data: {
            input: val,
            id: CurrentUserService.getUser().id
          },
        }).then(function(response){
          return response.data.map(function(item){
            return {
              label: `${item.Name} (${item.Symbol})`,
              result: item
            };
          });
        });
      }, 300);
  };

  vm.selectCompany = function($item, $model, $label){
    vm.company = $item;
    vm.getData();
  };

  /*
  * Get historic price data from Quandl
  */
  vm.getData = function(){
    event.preventDefault();
    vm.loadingMessage = "Loading...";
    vm.dataLoading = true;
    return $http({
      method: 'GET',
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${vm.company.result.Symbol}.json?api_key=s5sWLyV147fDnD7YssxU`
    }).then(function successCallback(response) {
      vm.dataLoading = false;
      vm.company.dataset = response.data.dataset;
      sortChartData();
      getLivePrice();

      vm.getTradeComments();
    }, function errorCallback(response) {
      vm.error = response;
      vm.loadingMessage = "Company not in database";
      setTimeout(function(){
        clearSearchBox();
      },2000);

      // document.getElementById("loadingMessage").innerHTML = "Company not in database";
    });
  };

  function clearSearchBox() {
    document.getElementById("stockSearch").value = "";
    vm.company = null;
    vm.dataLoading = false;
  }

  /*
  * Sorting Quandl data for use in Highcharts
  * - Create chart at the end
  */
  function sortChartData() {
    vm.company.dateInformation  = [];
    vm.company.priceInformation = [];

    for (var i = vm.company.dataset.data.length-1; i >= 0; i--) {
      let date = vm.company.dataset.data[i][0];
      vm.company.dateInformation.push(new Date(date));
      vm.company.priceInformation.push(vm.company.dataset.data[i][11]);
    }

    // Building a series with [date, value]
    vm.company.data = vm.company.dateInformation.map((date, i) => {
      return [date, vm.company.priceInformation[i]]
    });

    return prepareChart();
  }

  function prepareChart() {
    var chart = new Highcharts.Chart({
      chart: {
        renderTo: 'container',
        type: 'line',
        zoomType: 'x',
        rangeSelector: {
          selected: 1
        },
      },
      title: {
        text: vm.company.label,
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
        // dateTimeLabelFormats: {
        //   day: '%d %b %Y'
        // }
        // labels: {
        //   formatter: function() {
        //     return moment(this.value).format("YYYY");
        //   }
        // }
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
        data: vm.company.data,
        tooltip: {
          valueDecimals: 2
        }
      }]
    });
  }

  function getLivePrice(){
    return $http({
      method: 'POST',
      url: `${API}/getdetails`,
      data: {
        q: `${vm.company.result.Exchange}:${vm.company.result.Symbol}`
      },
    }).then(function successCallback(response) {
      vm.company.currentPrice = response.data[0].l_cur;
      vm.company.closingPrice = response.data[0].l;
    }, function errorCallback(response) {
      vm.error = response;
    });
  }

  vm.calculateValue = function(){
    vm.trade.book_value = vm.trade.number_of_shares * vm.company.currentPrice;
  };

  vm.submitBuyTrade = () => {
    Trade
    .save({ trade: vm.trade }).$promise
    .then(data => {
      $("#myModal").modal("hide");
      $state.go("usersShow", { id: CurrentUserService.getUser().id });
    })
    .catch(response => {
      console.log(response);
    });
  };

  vm.tradeStock = (trade) => {
    vm.trade = trade;
    getLivePrice(trade);
    vm.getData();
    vm.trade.trade_type = "buy";
  };

  vm.getTradeComments = () => {
    $http({
      method: 'GET',
      url: `${API}/trades`,
    }).then(function successCallback(response) {
      vm.company.trades = response.data;
    }, function errorCallback(response) {
      vm.error = response;
    });  };
  }
