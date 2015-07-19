angular.module('starter.controllers', ['firebase', 'angular.filter'])

.controller('RegisterCtrl', function($scope, $state, fireBaseData) {
    var firebaseRef = fireBaseData.ref(),
        authData = firebaseRef.getAuth();

    // if (authData) {
    //     $state.go('app.tabs.medicines');
    // }

    $scope.signInPage = function() {
        $state.go('login');
    }

    $scope.signUpPage = function() {
        $state.go('signup');
    }

})

.controller('SignUpController', function($scope, $state, $ionicPopup, fireBaseData) {
    var firebaseRef = fireBaseData.ref();

    $scope.signUp = function(email, password) {
        firebaseRef.createUser({
            email: email,
            password: password
        }, function(error, authData) {
            if (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Registration Failed!',
                    template: error
                });
                console.log("Registration Failed!", error);
            } else {
                firebaseRef.authWithPassword({
                    email: email,
                    password: password
                }, function(error, authData) {
                    if (error) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Login failed!',
                            template: 'Please check your credentials!'
                        });
                        console.log("Login Failed!", error);
                    } else {
                        console.log("Authenticated successfully with payload:", authData);

                    }
                });

                //$state.go('profile-details');
                $state.go('profile-details/:email', {
                    email: email
                });
                console.log("Registered successfully");
            }
        })
    }

    firebaseRef.onAuth(function(authData) {
        if (authData) {

            // save the user's profile into Firebase so we can list users,
            // use them in Security and Firebase Rules, and show profiles
            firebaseRef.child("users").child(authData.uid).set({
                type: "patient"
            });
        }
    });

})


.controller('ProfileDetailsController', function($scope, fireBaseData, $state, $stateParams, $DataService) {
    $scope.data = {};
    var email = $stateParams.email;
    $scope.saveDetails = function() {
        var userData = $scope.data,
            firebaseRef = fireBaseData.ref(),
            authData = firebaseRef.getAuth(),
            dateOfBirth = userData.dob,
            formatedDate = (dateOfBirth.getMonth() + 1) + '/' + dateOfBirth.getDate() + '/' + dateOfBirth.getFullYear();
        var userRef = firebaseRef.child("patients").child(authData.uid);

        $DataService.setUserData(firebaseRef.child("users").child(authData.uid));

        userRef.child('personalDetails').set({
            firstName: userData.firstName,
            lastName: userData.lastName,
            dob: formatedDate,
            sex: userData.sex,
            phone: userData.phone,
            email: email
        });

        userRef.child('settings').set({
            snoozTime: 10,
            morningReminder: "8.30",
            afternoonReminder: "13.30",
            eveningReminder: "18.00",
            nightReminder: "21.00",
            beforeMealBuffer: 60
        })

        $state.go('app.tabs.medicines');
    }
})

.controller('LoginCtrl', function($scope, $ionicPopup, $state, fireBaseData, $DataService) {
    var firebaseRef = fireBaseData.ref();
    $scope.showLoginForm = false; //Checking if user is logged in

    $scope.user = firebaseRef.getAuth();

    if (!$scope.user) {
        $scope.showLoginForm = true;
    }

    $scope.login = function(username, password) {
        var username = username;
        var password = password;
        firebaseRef.authWithPassword({
            email: username,
            password: password
        }, function(error, authData) {
            if (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Login failed!',
                    template: 'Please check your credentials!'
                });
                console.log("Login Failed!", error);
            } else {
                $scope.showLoginForm = false;
                // $DataService.setUserData(firebaseRef.child("patients").child(authData.uid));
                $state.go('app.tabs.medicines');
                console.log("Authenticated successfully with payload:", authData);
            }
        })

    }

    // Logout method
    $scope.logout = function() {
        fireBaseData.ref().unauth();
        $scope.showLoginForm = true;
    };

    firebaseRef.onAuth(function(authData) {
        if (authData) {

            console.log('hahaha')
                // save the user's profile into Firebase so we can list users,
                // use them in Security and Firebase Rules, and show profiles
            firebaseRef.child("users").child(authData.uid).set({
                type: "patient"
            });
            //   $state.go('app.tabs.medicines');
        }
    });

})

.controller('MyMedicinesController', function($scope, $state, fireBaseData, $TimeService) {
    var firebaseRef = fireBaseData.ref(),
        authData = firebaseRef.getAuth(),
        doctorsData = null,
        notificationTimings = null,
        curTime = new Date().getTime(),
        medicineList = {
            m: {},
            a: {},
            e: {},
            n: {}
        };

    var userRef = firebaseRef.child("patients").child(authData.uid);
    $scope.getDateFromat = function(timeStamp) {
        var date = new Date(parseInt(timeStamp));
        return date.toDateString(); //(date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
    }

    $scope.prescriptions = [];

    var todayTimeStamp = $scope.todayTimeStamp = new Date().setHours(0, 0, 0, 0);

    userRef.child('settings').on('value', function(snapshot) {
        notificationTimings = snapshot.val();
    })

    userRef.child('visits').startAt(todayTimeStamp).on("value", function(snapshot) {
        $scope.arrMedicines = [];
        var medicines = snapshot.val();
        var unsortedMeds = [];
        var medDates = [];

        function sortByKey(array, key) {
            return array.sort(function(a, b) {
                var x = a[key];
                var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }

        for (var key in medicines) {
            var med = medicines[key];
            var startDate = med.startDate;
            var cycle = med.duration;
            var frequency = med.frequency;
            var dosage = med.dosage;
            var medDate = null;
            var dose = null;
            var medDirection = med.medDirection;

            for (i = 0; i < cycle; i++) {
                if (i == 0) {
                    medDate = startDate
                } else {
                    medDate = $TimeService.getFutureDate(startDate, frequency);
                    medDate = $TimeService.getTimeStampFromDate(medDate);
                    frequency += med.frequency;
                }


                for (var dose in dosage) {
                    if (dosage[dose] > 0) {
                        var hours = notificationTimings[dose + "Reminder"].split('.')[0];
                        var minutes = notificationTimings[dose + "Reminder"].split('.')[1];
                        medDate = new Date(medDate).setHours(hours, minutes, 0, 0);
                        medDates.push(medDate);

                        unsortedMeds.push({
                            date: medDate,
                            name: med.name,
                            morning: med.dosage.morning,
                            afternoon: med.dosage.afternoon,
                            evening: med.dosage.evening,
                            night: med.dosage.night,
                            medDate: new Date(medDate).setHours(0, 0, 0, 0),
                            dose: dose,
                            medDirection: med.medDirection
                        });

                    }

                }

            }



        }
        var sortedMeds = sortByKey(unsortedMeds, 'date');
        var arrMeds = [];
        for (var med in sortedMeds) {

            if (sortedMeds[med].date > curTime) {
                $scope.arrMedicines.push(sortedMeds[med]);
            }

        }

        // for(var i =0 ; i<sortedMeds.length;i++) {
        //     if (sortedMeds[i].date > curTime) {
        //         $scope.arrMedicines.push(sortedMeds[i]);
        //     }
        // }

        // medDates.forEach(function(med) {
        //     $scope.arrMedicines.push(unsortedMeds[med]);
        // })
        $scope.$apply();
    });

    $scope.getDate = function(timeStamp) {
        var date = new Date(timeStamp)
        return (date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear());
    }

})

.controller('TabsPageController', function($scope, $state) {

})

.controller('doctorsController', function($scope, $state) {

})

.controller('AddMedicineController', function($scope, $state, fireBaseData, $TimeService, $DataService) {
    var firebaseRef = fireBaseData.ref(),
        authData = firebaseRef.getAuth(),
        userRef = firebaseRef.child("patients").child(authData.uid),
        medicineTimes = {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0
        }

    $scope.data = {};
    $scope.data.dosage = medicineTimes;
    $scope.increment = 1;
    $scope.medDirection = "After Meal";

    $scope.medicineAdd = function(val, time) {
        $scope.data.dosage[time] = val;
    }

    $scope.setMedDirection = function(directions) {

        setTimeout(function() {
            $scope.$apply(function() {
                $scope.medDirection = directions;

            });
        }, 100);
    }

    $scope.addMedicine = function() {

        var medData = $scope.data,
            medName = medData.medicine,
            startingFrom = parseInt(medData.startDate),
            startDate = $TimeService.getFutureDateFromToday(startingFrom),
            frequency = parseInt(medData.frequency),
            duration = parseInt(medData.duration),
            endDate = $TimeService.getFutureDateFromToday((startingFrom + frequency) * duration),
            endDateTimeStamp = $TimeService.getTimeStampFromDate(endDate);
        //  bAddTohistory = medData.medhistory;


        userRef.child('visits').push({
            name: medName,
            startDate: $TimeService.getTimeStampFromDate(startDate),
            frequency: frequency,
            dosage: $scope.data.dosage,
            duration: duration,
            endDate: endDateTimeStamp,
            medDirection: $scope.medDirection
                //   addToHistory: bAddTohistory
        }, function() {
            $state.go('app.tabs.medicines');
        }).setPriority(endDateTimeStamp);


        $scope.data = {
            dosage: {
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0
            },
            duration: 1,
            startDate: 0,
            frequency: 1
        };

        $scope.resetValues();
    }


    $scope.resetValues = function(value, bIncrement, bRound) {
        var elements = document.querySelectorAll('.medicineCount'),
            elementScope = [],
            val = value || 0;

        for (var i = 0; i < elements.length; i++) {
            var newScope = null;
            newScope = angular.element(elements[i]).scope();

            doSetTimeout(newScope)


        }

        function doSetTimeout(newScope) {
            setTimeout(function() {
                $scope.$apply(function() {
                    newScope.value = (bIncrement) ? (newScope.value + val) : val;
                    if (bRound == true) {
                        newScope.value = Math.floor(newScope.value);
                    }
                    $scope.medicineAdd({
                        value: newScope.value,
                        time: newScope.time
                    });

                });
            }, 100)
        }
    }



})
