angular
.module("bodhinomad")
.factory("IndexEpic", IndexEpic);

IndexEpic.$inject = ["$http"];
function IndexEpic($http) {
  let companyName = {};
  companyName.getName = function(companyName) {
    return   $http({
        method: 'POST',
        url: "http://localhost:3000/api/test"
      }).then(function successCallback(response) {
        homeCtrl.companyList = [];
        homeCtrl.companyList.push(response.data);
        console.log(homeCtrl.companyList);
      });
  };
  return companyName;
}
