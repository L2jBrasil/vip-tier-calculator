var app = angular.module('app', []);
            app.controller('testController', ['$scope', '$http', '$timeout',  function($scope, $http, $timeout) {
                
				var $ctrl = this;
				
                $scope.vipTiers = [
                    {"name": "Tier 1 VIP Status", required:80, depreciated: 80},
                    {"name": "Tier 2 VIP Status", required:800, depreciated: 400},
                    {"name": "Tier 3 VIP Status", required:2000, depreciated: 660},
                    {"name": "Tier 4 VIP Status", required:4000, depreciated: 1320},

                ];
				
                $scope.ngCoin = 4000;
                $scope.months = 6;


                $scope.calculateTier = function calculateTier(){
                    $scope.calculatedTier = [];
                    var totalBalance = $scope.ngCoin + 0;

					//Calculate each month
					var balanceByMonthAndTier = {};
                    for(var m = 0; m <= $scope.months;m++){
						var mKey = m+"_";
						
						//Init
						if(!balanceByMonthAndTier[mKey]){
							balanceByMonthAndTier[mKey] = [totalBalance,totalBalance,totalBalance,totalBalance];
						}
						
                        var calculatedMonth = {
                                month: m,
                                tiers: [],
                                balance: []
                        };
						
						for(var i in $scope.vipTiers){
							var tier =  angular.copy($scope.vipTiers[i]);
                           
                            var balanceNext = balanceByMonthAndTier[mKey][i] - (m*tier.depreciated);
                            if(balanceNext > 0){
                                balanceByMonthAndTier[mKey][i] = balanceNext;
								tier.balance = balanceNext;
                            }else{
								balanceByMonthAndTier[mKey][i] = 0;
								tier.balance = 0;
							}
							
							if(tier.balance >= tier.required){
                                tier.enabled =  true;
                            }else{
                                tier.enabled =  false;
                            }

							
							
                            calculatedMonth.tiers[i] = tier;
                        }
                        $scope.calculatedTier.push(calculatedMonth)
                    }

                };
				
                //Init:
                $scope.calculateTier($scope.months);
            }]);

function domReady(fn) {
        if (document.readyState != 'loading') {
            fn(document);
        } else if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', function () {
                fn(document)
            });
        } else {
            document.attachEvent('onreadystatechange', function () {
                if (document.readyState != 'loading') {
                    fn(document);
                }
            });
        }
    }
    function appBootstrapFn(document) {
        try {
            angular.bootstrap(document, ['app'], {
                strictDi: true
            });
            return angular.resumeBootstrap();
        } catch (e) {
            var keepconsole = console;
            keepconsole.warn("%c APP Bootstrap Error ", ["background: red", "color: white", "font-size: 11px"].join(";"));
            keepconsole.error(e);
            return !0;
        }
    }
    ;
    if (document.readyState == "complete") {
        appBootstrapFn(document);
    } else {
        domReady(appBootstrapFn);
    }

