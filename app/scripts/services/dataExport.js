'use strict';

angular.module('bsis').factory('DataExportService', function(Api) {
  return {

    getDataExport: function(onSuccess, onError) {
      return Api.DataExport.download().then(onSuccess, function(err) {
        // decode the arraybuffer into the error data object returned by the server
        var decodedErrData = String.fromCharCode.apply(null, new Uint8Array(err.data));
        var errData = angular.fromJson(decodedErrData);
        onError(errData);
      });
    }

  };
});
