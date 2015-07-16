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
                readonly : "="
            },
            transclude: false,
            //template: '<label class="toggle toggle-positive custom-toggle"><div class="track"><div class="handle"></div></div></label>',
            template: function(element, attrs) {
                var className = attrs.class;
                var arrMedicineTime = ['<label on-hold="popit($event)"  ng-click="add()" class="medicine-widget toggle toggle-positive custom-toggle ' + attrs.time + '">'];
                arrMedicineTime.push('<div class="track" ng-class="{closed : openWidget}"><div class="handle"></div>');
                arrMedicineTime.push('<div class="medicineCount">{{value}}</div></div></label>');
                return arrMedicineTime.join('');
            },

            controller: function($scope, $element, $attrs, $ionicPopover) {
                $scope.value = $scope.data || 0;
                $scope.time = $attrs.time;
                if ($scope.dose) {
                    $scope.openWidget = ($scope.dose == $scope.time) ? false : true;
                }
                $scope.add = function() {
                    if($scope.readonly) {
                        return false;
                    }
                    $scope.value += $scope.$parent.increment;
                    $scope.callback({
                        value: $scope.value,
                        time: $scope.time
                    });
                }

                $scope.popit = function($event) {
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
                                //medicineTimes[$event.gesture.target.getAttribute('time')] = 0;
                                $scope.value = 0;
                                $scope.callback({
                                    value: $scope.value,
                                    time: $scope.time
                                });
                                popover.hide();
                            }

                            $scope.fractionDosage = function() {
                                $scope.$parent.increment = ($scope.$parent.increment == 0.5) ? 1 : 0.5;
                                $scope.value += $scope.$parent.increment;

                                $scope.callback({
                                    value: $scope.value,
                                    time: $scope.time
                                });
                                popover.hide();
                            }

                            $scope.asNeeded = function() {
                                var elements = document.querySelectorAll('.medicineCount'),
                                    elementScope = [];

                                for (var i = 0; i < elements.length; i++) {
                                    var newScope = null;
                                    newScope = angular.element(elements[i]).scope();

                                    doSetTimeout(newScope)


                                }

                                function doSetTimeout(newScope) {
                                    setTimeout(function() {
                                        $scope.$apply(function() {
                                            newScope.value = 0;
                                        });
                                    }, 100)
                                }

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
