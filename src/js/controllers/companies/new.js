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
  };

  /*
   * Get historic price data from Quandl
   */
  vm.getData = function(){
    event.preventDefault();
    return $http({
      method: 'GET',
      url: `https://www.quandl.com/api/v3/datasets/WIKI/${vm.company.result.Symbol}.json?api_key=s5sWLyV147fDnD7YssxU`
    }).then(function successCallback(response) {
      vm.company.dataset = response.data.dataset;
      sortChartData();
      getLivePrice();
    }, function errorCallback(response) {
      vm.error = response;
    });
  };

  /*
   * Sorting Quandl data for use in Highcharts
   * - Create chart at the end
   */
  function sortChartData() {
    vm.company.dateInformation  = [];
    vm.company.priceInformation = [];

    for (var i = vm.company.dataset.data.length-1; i >= 0; i--) {
      vm.company.dateInformation.push(vm.company.dataset.data[i][0]);
      vm.company.priceInformation.push(vm.company.dataset.data[i][11]);
    }
    return prepareChart();
  }

  function prepareChart() {
    var chart = new Highcharts.Chart({
      chart: {
        renderTo: 'container',
        type: 'line',
      },
      title: {
        text: vm.company.label,
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
        name: vm.company.label,
        showInLegend: false,
        data: vm.company.priceInformation
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
}
