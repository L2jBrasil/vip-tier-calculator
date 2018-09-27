var app = angular.module('app', []);
 app.controller('testController', ['$scope', function($scope) {
                
				var $ctrl = this;
				
                $scope.vipTiers = [
                    {"name": "Tier 1 VIP Status", required:80, depreciated: 80},
                    {"name": "Tier 2 VIP Status", required:800, depreciated: 400},
                    {"name": "Tier 3 VIP Status", required:2000, depreciated: 660},
                    {"name": "Tier 4 VIP Status", required:4000, depreciated: 1320},

                ];
				
				$scope.ncoinPackages = [
					{amount: 400, price: 5.00},
					{amount: 800, price: 10.00},
					{amount: 1600, price: 20.00},
					{amount: 4000, price: 50.00},
					{amount: 8000, price: 100.00},
					{amount: 20000, price: 250.00}
				];
				
				$scope.getBestPackage  = function getBestPackage(ncoin){
					var pack;
					for(var i in $scope.ncoinPackages){
						var pack = $scope.ncoinPackages[i];
						if(pack.amount  >= ncoin){
							return pack;
						}
					} 
					return pack;//if is greater return  the last
				};
				
				$scope.getNearstPackages =  function getNearstPackages(ncoin){
					var best = {total: 0, totalncoin: 0, packs: []};				
					var enougth = false;
					while(!enougth){
						var  found = $scope.getBestPackage(ncoin);
						ncoin = ncoin - found.amount
						enougth = ncoin <= 0;
						best.packs.push(found);
						best.total  = best.total + found.price;
						best.totalncoin = best.totalncoin + found.amount;
					}
					return best;					
				};
				
				$scope.mode = 2;
                $scope.ngCoin = 80;
                $scope.months = 2;


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
                //$scope.calculateTier();				
				
				$scope.calculateNcoin = function calculateNcoin(){
					var tier = angular.copy( $scope.selected ) ;
					$scope.totalBalance =   0; //Initial Balance
					$scope.totalRM = 0;
					$scope.totalDepreciated = (($scope.months - 1)*tier.depreciated);
					
					$scope.calculatedNcoin = [];
					
					for(var m = 1; m <= $scope.months;m++){
						
						var calculatedMonth = {
                                month: m,
                                purchace: 0,
								vip: 0,
								balance:0,
								packs: null
                        };
						
						if(m==1){
							calculatedMonth.packs = $scope.getNearstPackages(tier.required);
							$scope.totalBalance  = tier.required;
							calculatedMonth.purchace  = tier.required;
							calculatedMonth.balance  = calculatedMonth.packs.totalncoin;
							$scope.totalRM = calculatedMonth.packs.total;
						}else{
							var c = $scope.calculatedNcoin.length;
							var balance = $scope.calculatedNcoin[c-1].balance -  tier.depreciated; //Current balance aready less the current depreciated
							calculatedMonth.purchace  = tier.required - balance;
							//You have enough to keep the tier
							if(calculatedMonth.purchace < 0){
								calculatedMonth.packs = {total: 0, totalncoin: 0, packs: []};
								calculatedMonth.balance  = balance ;
								calculatedMonth.vip =  balance
								calculatedMonth.purchace = 0;
							}else{
								calculatedMonth.packs = $scope.getNearstPackages(calculatedMonth.purchace);
								calculatedMonth.vip =  balance;
								calculatedMonth.balance  = balance + calculatedMonth.packs.totalncoin;
							}
							
							$scope.totalBalance  = $scope.totalBalance + calculatedMonth.purchace;
							$scope.totalRM = $scope.totalRM + calculatedMonth.packs.total;
						}
						
						$scope.calculatedNcoin.push(calculatedMonth);
					}
				};
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
        } catch (e) {
            var keepconsole = console;
            keepconsole.warn("%c APP Bootstrap Error ", ["background: red", "color: white", "font-size: 11px"].join(";"));
            keepconsole.error(e);
            return !0;
        }
};
if (document.readyState == "complete") {
     appBootstrapFn(document);
} else {
    domReady(appBootstrapFn);
}

