angular
  .module("bodhinomad")
  .controller("mainCtrl", mainCtrl);

mainCtrl.$inject = ["$rootScope", "CurrentUserService", "$state"];
function mainCtrl($rootScope, CurrentUserService, $state) {
  const vm = this;

  vm.user = CurrentUserService.getUser();

  vm.logout = () => {
    event.preventDefault();
    CurrentUserService.clearUser();
  };

  $rootScope.$on("loggedIn", () => {
    vm.user = CurrentUserService.getUser();
    $state.go("companiesNew");
  });

  $rootScope.$on("loggedOut", () => {
    vm.user = null;
    $state.go("companiesNew");
  });
}
