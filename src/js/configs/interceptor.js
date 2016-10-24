angular
.module("bodhinomad")
.config(SetupInterceptor);

SetupInterceptor.$inject = ['$httpProvider'];
function SetupInterceptor($httpProvider){
  return $httpProvider.interceptors.push('AuthInterceptor');
}
