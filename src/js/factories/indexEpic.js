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
        newCompanyCtrl.companyList = [];
        newCompanyCtrl.companyList.push(response.data);
        console.log(newCompanyCtrl.companyList);
      });
  };
  return companyName;
}
