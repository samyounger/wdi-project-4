angular
.module("bodhinomad")
.controller("companiesShowCtrl", companiesShowCtrl);

companiesShowCtrl.$inject = ["$http", "$resource", "IndexEpic", "CurrentUserService"];
function companiesShowCtrl($http, $resource, IndexEpic, CurrentUserService) {

}
