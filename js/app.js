
angular.module('healthy', ['ionic','healthy.services','healthy.controllers','firebase','angular-web-notification','ui.select','chart.js','ngImgCrop'])

.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
})
.directive('fileChanged', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function ($scope, element, attrs, ngModel) {
            if (!ngModel) {
                return;
            }

            ngModel.$render = angular.noop;

            element.bind('change', function (event) {
                ngModel.$setViewValue(event.target.files[0]);
                $scope.$apply();
            });
        }
    };
})

 .factory('FileReader', function ($q, $window) {

    if (!$window.FileReader) {
        throw new Error('Browser does not support FileReader');
    }

    function readAsDataUrl(file) {
        var deferred = $q.defer(),
            reader = new $window.FileReader();

        reader.onload = function () {

            var infosize = Math.round(file.size/1024);
            if(infosize <= 2000){
              deferred.resolve(reader.result);
            }else{
              deferred.resolve(null);
            }
            
        };

        reader.onerror = function () {
            deferred.reject(reader.error);
        };

        reader.readAsDataURL(file);

        return deferred.promise;
    }

    return {
        readAsDataUrl: readAsDataUrl
    };
}).
directive('filePreview', function (FileReader) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            filePreview: '='
        },
        link: function (scope, element, attrs,ngModel) {
            if(!ngModel){
              return;
            }
            ngModel.$render = angular.noop;
            scope.$watch('filePreview', function (filePreview) {
                if (filePreview && filePreview.name) {
                    FileReader.readAsDataUrl(filePreview).then(function (result) {
                        if(!result){
                          alert('Gambar terlalu besar,ukuran maksimal adalah 2MB.');
                        }else{
                          element.attr('src', result);
                          ngModel.$setViewValue(result);
                        }
                        
                    });
                }
            });
        }
    };
})



.run(function(Auth,$state,$rootScope,LoginSer) {
    var mdlUpgradeDom = false;
    setInterval(function() {
      if (mdlUpgradeDom) {
        componentHandler.upgradeDom();
        mdlUpgradeDom = false;
      }
    }, 0);

    var observer = new MutationObserver(function () {
      mdlUpgradeDom = true;
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

      var result = LoginSer.cekAuth();
      result.then(function(bisa){
        if(bisa){
          $state.go('dash.home');
        }else{
          $state.go('login');
        }
      });

      $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (error === "AUTH_REQUIRED") {
            $state.go('login');
        }
    });


})

.config(function($stateProvider, $urlRouterProvider,ChartJsProvider) {
  
  ChartJsProvider.setOptions({ colors : [ '#f1c40f', '#419fdd', '#f39c12', '#1abc9c', '#34495e', '#2ecc71', '#8e44ad'] });
  $stateProvider

  // setup an abstract state for the tabs directive
    
    .state('login', {
    url: '/login',
    templateUrl: 'templates/login/login.html',
    controller :'loginCtrl' ,
    resolve: {
            // controller will not be loaded until $waitForAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $waitForAuth returns a promise so the resolve waits for it to complete
                    return Auth.$waitForAuth();
        }]
        }
  })

     
    .state('dash', {
    url: '/dash',
    templateUrl: 'templates/dash.html',
    abstract :true,
    controller: 'AplCtrl' ,
     resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth.$requireAuth();
      }]
        }
    
  })


     .state('dash.pasien', {
    url: '/pasien',
    views: {
      'tab-dash': {
        templateUrl: 'templates/pasien/pasien.html'
      }
    }
  })

   .state('dash.klinik', {
    url: '/klinik',
    views: {
      'tab-dash': {
        templateUrl: 'templates/klinik/klinik.html'
      }
    }
  })


   .state('dash.detailklinik', {
    url: '/klinik/detail',
    views: {
      'tab-dash': {
        templateUrl: 'templates/klinik/klinik_detail.html'
      }
    }
  })

   .state('dash.detailpasien', {
    url: '/pasien/detail',
    views: {
      'tab-dash': {
        templateUrl: 'templates/pasien/detail-pasien.html'
      }
    }
  })

 .state('dash.home', {
    url: '/home',
    views: {
      'tab-dash': {
        templateUrl: 'templates/home/home.html',
        controller: 'HomeCtrl'
      }
    }
  })

 .state('dash.profile',{
  url: '/profile',
  views : {
    'tab-dash':{
      templateUrl: 'templates/profile/pegawai_profile.html'
    }
  }
 })

        .state('dash.dokter', {
    url: '/dokter',
    views: {
      'tab-dash': {
        templateUrl: 'templates/dokter/dokter.html'
      }
    }
  })

  .state('dash.asuransi', {
    url: '/asuransi',
    views: {
      'tab-dash': {
        templateUrl: 'templates/asuransi/asuransi.html'
      }
    }
  })

  .state('dash.registrasi', {
    url: '/registrasi',
    views: {
      'tab-dash': {
        templateUrl: 'templates/registrasi/registrasi.html',
        controller: 'RegisCtrl'
      }
    }
  })

     .state('dash.detaildokter', {
    url: '/dokter/detail',
    views: {
      'tab-dash': {
        templateUrl: 'templates/dokter/dokter_detaildokter.html'
      }
    }
  })

    .state('dash.pembayaran', {
    url: '/pembayaran',
    views: {
      'tab-dash': {
        templateUrl: 'templates/pembayaran/pembayaran.html',
        controller: 'BayarCtrl'
      }
    }
  })

;

 //$urlRouterProvider.otherwise('/dash/home');

});

