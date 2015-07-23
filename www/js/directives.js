angular.module('starter.controllers')

.directive("medicineTime", [

    function() {
        return {
            restrict: "AEC",
            replace: true,
            scope: {
                time: '=',
                callback: "&",
                data: "=",
                dose: "=",
                readonly: "=",
                nextmed: "=",
                asneeded:"="
            },
            transclude: false,
            //template: '<label class="toggle toggle-positive custom-toggle"><div class="track"><div class="handle"></div></div></label>',
            template: function(element, attrs) {
                var className = attrs.class;
                var arrMedicineTime = ['<label ng-class="{openWidget : openWidget, asNeeded : bAsNeeded}" on-hold="popit($event)"  ng-click="add()" class="medicine-widget toggle toggle-positive custom-toggle ' + attrs.time + '">'];
                arrMedicineTime.push('<div class="track" ng-class="{open : openWidget}"><div class="handle"></div>');
                arrMedicineTime.push('<div class="medicineCount">{{value}}</div></div></label>');
                return arrMedicineTime.join('');
            },

            controller: function($scope, $element, $attrs, $ionicPopover) {
                $scope.value = $scope.data || 0;
                $scope.bAsNeeded = $scope.asneeded || false;
                if($scope.asneeded > 0) {
                    $scope.value = $scope.asneeded;
                }
                $scope.time = $attrs.time;
                var nWidetCount = document.querySelectorAll('.medicineCount').length == 4; //TODO : find better solution
                
                if ($scope.dose) {
                    $scope.openWidget = ($scope.dose == $scope.time && $scope.nextmed == true) ? true : false;
                }

                $scope.add = function() {
                    var time = $scope.time;
                    if ($scope.readonly) {
                        return false;
                    }
                    $scope.value += $scope.$parent.increment;
                    if($scope.bAsNeeded) {
                        time = "asneeded"
                    }
                    $scope.callback({
                        value: $scope.value,
                        time: time
                    });
                }


                $scope.bFractionDose = false;

                $scope.popit = function($event) {
                    if ($scope.readonly) {
                        return false;
                    }
                    $ionicPopover.fromTemplateUrl('templates/popover.html', {
                            scope: $scope
                        })
                        .then(function(popover) {
                            popover.show($event);

                            //Cleanup the popover when we're done with it!
                            $scope.$on('$destroy', function() {
                                $scope.popover.remove();
                                console.log('popover removed');
                            });

                            $scope.popupReset = function() {
                                $scope.$parent.resetValues();
                                popover.hide();
                            }

                            $scope.fractionDosage = function() {
                                var bIncrement = true,
                                    bRound = false,
                                    incrementVal = 0;
                                if ($scope.$parent.increment == 0.5) {
                                    $scope.$parent.increment = 1;
                                    $scope.bFractionDose = false;
                                    incrementVal = 0;
                                    bRound = true;
                                } else {
                                    $scope.$parent.increment = 0.5;
                                    incrementVal = 0.5;
                                    $scope.bFractionDose = true;
                                }

                                $scope.$parent.resetValues(incrementVal, bIncrement, bRound);
                                popover.hide();
                            }

                            $scope.asNeeded = function() { 

                                $scope.$parent.resetValues();
                                
                                $scope.bAsNeeded  = !($scope.bAsNeeded);
                                var otherWidgets = document.querySelectorAll('.dosage-wrap .medicine-widget');

                                for(var i = 0;i< otherWidgets.length;i++) {
                                    otherWidgets[i].style.display = ($scope.bAsNeeded == true) ? "none" : "inline-block"

                                   // otherWidgets[i].style.display = "none";
                                }
                                $scope.$parent.setMedDirection("As Needed");
                                $event.target.style.display = "inline-block";
                                popover.hide();
                            }

                            $scope.beforeMeal = function() {
                                $scope.$parent.setMedDirection("Before Meal");
                                popover.hide();
                            }
                            $scope.afterMeal = function() {
                                $scope.$parent.setMedDirection("After Meal");
                               popover.hide();
                            }
                            $scope.withMilk = function() {
                               $scope.$parent.setMedDirection("With Meal");
                               popover.hide();
                            }

                            $scope.$on('popover.hidden', function() {
                                // manually remove DOM elements
                                angular.element(document.querySelector('.popover-backdrop')).remove();
                                //popover.remove();
                                //stopListening();
                            });
                        });
                }
            }
        };
    }
]);
