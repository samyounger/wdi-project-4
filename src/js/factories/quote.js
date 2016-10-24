angular
.module("bodhinomad")
.factory("Quote", Quote);

Quote.$inject = ["$resource"];
function Quote($resource) {
  return   $resource('https://finance.google.com/finance/info',{
    client:'ig',
    callback:'JSON_CALLBACK'
  },{
    "query": {
      method:'JSONP',
      params:{q:'INDEXSP:.INX'},
      isArray: true
    }}
  );
}
