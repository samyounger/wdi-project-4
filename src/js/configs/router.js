angular
.module("bodhinomad")
.config(Router);

Router.$inject = ["$stateProvider", "$locationProvider", "$urlRouterProvider"];
function Router($stateProvider, $locationProvider, $urlRouterProvider){
  $locationProvider.html5Mode(true);

  $stateProvider
  .state("home", {
    url: "/",
    templateUrl: "/js/views/home.html",
    controller: "homeCtrl as home"
  })
  .state("register", {
    url: "/register",
    templateUrl: "/js/views/register.html",
    controller: "registerCtrl as register",
  })
  .state("login", {
    url: "/login",
    templateUrl: "/js/views/login.html",
    controller: "loginCtrl as login",
  })

  //users Router
  .state("usersIndex", {
    url: "/users/index",
    templateUrl:  "/js/views/users/index.html",
    controller:   "usersIndexCtrl as index",
  })
  .state('usersShow', {
			url: "/users/:id",
			templateUrl: "/js/views/users/show.html",
      controller: "usersShowCtrl as show"
		})

    .state('usersEdit', {
      url: "/novels/edit",
      templateUrl: "/js/views/users/edit.html",
      controller: "usersEditCtrl as edit"
    });

  $urlRouterProvider.otherwise("/");
}
