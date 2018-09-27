var app = angular.module('app', []);
 app.controller('testController', ['$scope', function($scope) {
                
				var $ctrl = this;
				
							
				
				$scope.mode = 2;
                $scope.ngCoin = 80;
                $scope.months = 2;
				$scope.optimized = false;
				
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
				
				$scope.getBestPackagesByLowerstPrice  = function getBestPackagesByLowerstPrice(ncoin){
					var packs = [];
					var lowerprice = null;
					var bestPack = null;
					for(var i in $scope.ncoinPackages){
						var pack = $scope.ncoinPackages[i];
						packs[i] = [];
						var needed = ncoin;
						var total = 0;
						
						while(needed > 0){
							total =  total  + pack.price; //LowerstPrice
							packs[i].push(pack);
							needed = needed - pack.amount;
						}						
						
						if(lowerprice == null || lowerprice >=   total){
							if(lowerprice == total){
								var currentBest = packs[bestPack];
								if(currentBest.length >  packs[i].length){
									lowerprice = total;
									bestPack = i;
								}
							
							}else{
								lowerprice = total;
								bestPack = i;
							}
							
						}
					} 
					
					var best = {total: 0, totalncoin: 0, packs: []};
					for(var i in  packs[bestPack]){
						var p =  packs[bestPack][i];
						best.total  = best.total + p.price; //Total Real money
						best.totalncoin = best.totalncoin + p.amount; //Total ncoin
						best.packs.push(p);
					}
					
					
					return best;//if is greater return  the last
				};


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
					$scope.totalRMBestPack = 0;
					$scope.totalDepreciated = (($scope.months - 1)*tier.depreciated);
					
					$scope.calculatedNcoin = [];
					
					for(var m = 1; m <= $scope.months;m++){
						
						var calculatedMonth = {
                                month: m,
                                purchace: 0,
								vip: 0,
								balance:0,
								packs: null,
								bestpacks: null,
								bestbalance: 0
                        };
						
						if(m==1){
							calculatedMonth.packs = $scope.getNearstPackages(tier.required);
							$scope.totalBalance  = tier.required;
							calculatedMonth.purchace  = tier.required;
							calculatedMonth.balance  = calculatedMonth.packs.totalncoin;
							$scope.totalRM = calculatedMonth.packs.total;
							
							//Best pack calc
							calculatedMonth.bestpacks = $scope.getBestPackagesByLowerstPrice(tier.required);
							$scope.totalRMBestPack = calculatedMonth.bestpacks.total;
							calculatedMonth.bestbalance = calculatedMonth.bestpacks.totalncoin
							
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
							
							
							//Another approach is calculate the optimized packs to fill the tier. 
							//Calculate based on bestpack:
							var currentBalance = $scope.calculatedNcoin[c-1].bestbalance; //Current balance for this month
							if(currentBalance  >=  tier.required){ //You have enough to keep the tier next month
								calculatedMonth.bestpacks = {total: 0, totalncoin: 0, packs: []}; //You do not need to buy nothing else
								calculatedMonth.bestbalance =  currentBalance - tier.required
							}else{
								var howMuchShouldBuy = tier.required - currentBalance;
								calculatedMonth.bestpacks = $scope.getBestPackagesByLowerstPrice(howMuchShouldBuy);								
								calculatedMonth.bestbalance = calculatedMonth.bestpacks.totalncoin;					
							}
							$scope.totalRMBestPack = $scope.totalRMBestPack + calculatedMonth.bestpacks.total; //update real money spend with best packs
							
						}
						
						
						
						$scope.calculatedNcoin.push(calculatedMonth);
					}
					console.info("Calculated Coins",$scope.calculatedNcoin);
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

