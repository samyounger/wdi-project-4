angular
.module("bodhinomad")
.controller("companiesNewCtrl", companiesNewCtrl);

companiesNewCtrl.$inject = ["Trade", "$http", "$resource", "IndexEpic", "CurrentUserService", "$stateParams"];
function companiesNewCtrl(Trade, $http, $resource, IndexEpic, CurrentUserService, $stateParams) {
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
  vm.companyDetails = companyDetails;

  // Filter company name
  vm.companyName = "";

  // Processing trade
  vm.valueCalculate = valueCalculate;
  vm.value = "";

  function valueCalculate(sharesNo, price) {
    vm.value = sharesNo * price;
    console.log(vm.value)
  }

  // Chart data request, & live price data request
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
      companyNameFilter();
      sortChartData();
      prepareChart();
      companyDetails();
    }, function errorCallback(response) {
    });
  };

  function sortChartData() {
    for (var i = vm.companyData[0].data.length-1; i >= 0; i--) {
      vm.companyDateData.push(vm.companyData[0].data[i][0]);
      vm.companyPriceData.push(vm.companyData[0].data[i][11]);
    }
  }

  function companyNameFilter() {
    vm.companyName = vm.companyData[0].name.slice(0, vm.companyData[0].name.indexOf(")")+1);
  }

  function prepareChart() {
    var chart = new Highcharts.Chart({
      chart: {
        renderTo: 'container',
        type: 'line',
      },
      title: {
        text: vm.companyName,
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
        name: vm.companyName,
        showInLegend: false,
        data: vm.companyPriceData
      }]
    });
  }

  function companyIndexEpic() {
    $http({
      method: 'POST',
      url: "http://localhost:3000/api/company",
      data: { input: vm.companySearch },
    }).then(function successCallback(response) {
      vm.companyList = [];
      vm.companyList.push(response.data);
    });
  }

  function companyDetails() {
    $http({
      method: 'POST',
      url: "http://localhost:3000/api/getdetails",
      data: { q: `${vm.companyIndex}:${vm.companyEpic}` },
    }).then(function successCallback(response) {
      vm.detailsReturned = [];
      vm.detailsReturned.push(response.data);
    });
  }

  vm.submitBuyTrade = () => {
    Trade
    .save($stateParams, {
      trade_type: "buy",
      epic: vm.companyEpic,
      number_of_shares: vm.number_of_shares,
      price: vm.detailsReturned[0][0].l_cur,
      value: vm.value
    }).$promise
    .then(data => {
      Trade.get($stateParams, data => {
        console.log(data)
      });
    }).error(response => {
      console.log(response)
    });
  };
}
