angular.module('bsis').factory('RoutingService', function($location) {
  return {

    /**
     * Find the path which is currently active from a list of provided routes.
     *
     * @param routes {Object[]} The routes to match against.
     * @param routes[].path {string} The path to match.
     * @param routes[].subpaths {string[]} The list of subpaths to match.
     *
     * @return {?string} The matching path.
     */
    getCurrentPath: function(routes) {

      var path = $location.path();

      var matchedRoute = routes.find(function(route) {

        // Check if the route's path matches the current path
        if (path.indexOf(route.path) === 0) {
          return true;
        }

        // Check if any of the subpaths match the current path
        return route.subpaths.some(function(subpath) {
          return path.indexOf(subpath) === 0;
        });
      });

      return matchedRoute ? matchedRoute.path : null;
    }
  };
});
