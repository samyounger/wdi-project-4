angular
  .module("bodhinomad")
  .controller("homeCtrl", homeCtrl);

homeCtrl.$inject = ["User", "CurrentUserService"];
function homeCtrl(User, CurrentUserService) {

}
