angular
  .module("bodhinomad")
  .controller("homeCtrl", homeCtrl);

homeCtrl.$inject = ["$http", "$resource", "$scope"];
function homeCtrl($http, $resource, $scope) {
  const vm = this;

  vm.companyEpic = "";
  vm.companyData = [];
  vm.chartData = [];
  vm.stockPrice = getStockPrice;

  vm.getData = function(){
    event.preventDefault();
    vm.companyData = [];
    // vm.chartData = [];
    $http({
      method: 'GET',
      url: "https://www.quandl.com/api/v3/datasets/WIKI/" + vm.companyEpic + ".json?api_key=s5sWLyV147fDnD7YssxU"
    }).then(function successCallback(response) {
      vm.companyData.push(response.data.dataset);
      sortChartData();
      prepareChart();
      console.log(vm.chartData)
    }, function errorCallback(response) {
    });
  };

  function sortChartData() {
    for (var i = 0; i < vm.companyData[0].data.length; i++) {
      vm.chartData.push(vm.companyData[0].data[i][4]);
    }
  }

  function prepareChart() {
    var chart = new Highcharts.Chart(options);
  }

  let options = {
    chart: {
      renderTo: 'container',
      type: 'line'
    },
    series: [{
      name: 'Jane',
      data: vm.chartData
    }]
  };

  // Get an up to date stock price from Google Finance website
  vm.googleFinance = $resource('https://finance.google.com/finance/info',{
    client:'ig',
    callback:'JSON_CALLBACK'
  },{
    get: {
      method:'JSONP',
      params:{q:'INDEXSP:.INX'},
      isArray: true
    }}
  );

  vm.indexResult = vm.googleFinance.get();

  function getStockPrice() {
    $resource('https://finance.google.com/finance/info',{
      client:'ig',
      callback:'JSON_CALLBACK'
    },{
      get: {
        method:'JSONP',
        params:{q:'INDEXSP:.INX'},
        isArray: true
      }}
    );
  }

  // Type in the company name
  // Return the company EPIC code
  // http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?count=3&input=micro


  function getCompanyEpic(){
    $http({
      method: 'GET',
      url: "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json",
      params: {
        count: 3,
        input: "micro"}
        // headers: {
        //   'Content-Type': 'application/json'
        // }
      }).then(function successCallback(response) {
        vm.companyEpic.push(response);
        console.log(response);
      }, function errorCallback(response) {
      });
    }

    getCompanyEpic();

  }
