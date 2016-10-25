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
        companiesNewCtrl.companyList = [];
        companiesNewCtrl.companyList.push(response.data);
        console.log(companiesNewCtrl.companyList);
      });
  };
  return companyName;
}
