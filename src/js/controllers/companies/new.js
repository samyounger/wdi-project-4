angular
.module("bodhinomad")
.controller("companiesNewCtrl", companiesNewCtrl);

companiesNewCtrl.$inject = ["Trade", "$http", "$resource", "CurrentUserService", "API", "$state"];
function companiesNewCtrl(Trade, $http, $resource, CurrentUserService, API, $state) {
  const vm = this;

  vm.trade = {
    trade_type: "buy"
  };

  vm.getCompany = function(val){
    return $http({
      method: 'POST',
      url: `${API}/company`,
      data: { input: val },
      transformResponse: function (data, headersGetter, status) {
        // Catch the error if there is a parsing the JSON
        if (data) {
          try {
            data = JSON.parse(data);
          } catch(e){
            data = null;
          }
        }
        return data;
      }
    }).then(function(response){
      return response.data.map(function(item){
        return {
          label: `${item.Name} (${item.Symbol})`,
          result: item
        };
      });
    });
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
      let year = date.slice(0,4),
          month = date.slice(5, 7),
          day = date.slice(8, 10);

      date = `${day}/${month}/${year}`;

      var parts =date.split('/');
      //please put attention to the month (parts[0]), Javascript counts months from 0:
      // January - 0, February - 1, etc
      var mydate = new Date(parts[2],parts[0]-1,parts[1]);

      // date = new Date(date);

      vm.company.dateInformation.push(mydate);
      vm.company.priceInformation.push(vm.company.dataset.data[i][11]);
    }
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
        name: vm.company.label,
        data: vm.company.priceInformation,
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
