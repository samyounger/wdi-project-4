angular
.module("bodhinomad")
.controller("homeCtrl", homeCtrl);

homeCtrl.$inject = ["$http", "$resource", "IndexEpic"];
function homeCtrl($http, $resource, IndexEpic) {
  const vm = this;

  // Search box processing input/output
  vm.companySearch = "";
  vm.companyEpic = "";
  vm.companyIndex = "";
  vm.companyList = [];
  vm.getCompanyList = companyIndexEpic;

  // Chart Data
  vm.companyData = [];
  vm.companyPriceData = [];
  vm.companyDateData = [];

  // Google Finance input/output
  vm.detailsReturned = [];


  vm.getData = function(){
    event.preventDefault();
    vm.companyEpic = vm.companyList[0][0].Symbol;
    vm.companyIndex = vm.companyList[0][0].Exchange;

    vm.companyPriceData = [];
    vm.companyDateData = [];
    vm.companyData = [];
    $http({
      method: 'GET',
      url: "https://www.quandl.com/api/v3/datasets/WIKI/" + vm.companyEpic + ".json?api_key=s5sWLyV147fDnD7YssxU"
    }).then(function successCallback(response) {
      vm.companyData.push(response.data.dataset);
      sortChartData();
      prepareChart();
      companyDetails();
    }, function errorCallback(response) {
    });
  };

  function sortChartData() {
    for (var i = 0; i < vm.companyData[0].data.length; i++) {
      vm.companyDateData.push(vm.companyData[0].data[i][0]);
      vm.companyPriceData.push(vm.companyData[0].data[i][4]);
    }
  }

  function prepareChart() {
    var chart = new Highcharts.Chart({
      chart: {
        renderTo: 'container',
        type: 'line',
      },
      title: {
        text: vm.companyData[0].name,
      },
      xAxis: {
        title: {
          text: 'Date'
        }
      },
      yAxis: {
        title: {
          text: 'Price (USD)'
        }
      },
      series: [{
        showInLegend: false,
        data: vm.companyPriceData
      }]
    });
  }

  // Quote
  //   .query()
  //   .$promise
  //   .then(data => {
  //     console.log(data);
  //   });


  // Get an up to date stock price from Google Finance website
  // vm.googleFinance = $resource('https://finance.google.com/finance/info',{
  //   client:'ig',
  //   callback:'JSON_CALLBACK'
  // },{
  //   get: {
  //     method:'JSONP',
  //     // params:{q:'INDEXSP:.INX'},
  //     params:{q:`${vm.companyIndex}:${vm.companyEpic}`},
  //     // params:{q:'NASDAQ:MSFT'},
  //     isArray: true
  //   }}
  // );
  //
  // vm.indexResult = vm.googleFinance.get();

  // Type in the company name
  // Return the company EPIC code
  // http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?count=3&input=micro

  function companyIndexEpic() {
    $http({
      method: 'POST',
      url: "http://localhost:3000/api/company",
      data: { input: vm.companySearch },
    }).then(function successCallback(response) {
      vm.companyList = [];
      vm.companyList.push(response.data);
      // console.log(vm.companyList);
    });
  }

  function companyDetails() {
    $http({
      method: 'POST',
      url: "http://localhost:3000/api/getdetails",
      data: { q: vm.companyEpic },
    }).then(function successCallback(response) {
      vm.detailsReturned = [];
      vm.detailsReturned.push(response.data);
      console.log(vm.detailsReturned);
    });
  }

}
