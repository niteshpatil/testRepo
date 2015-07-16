angular.module('starter.controllers', ['firebase'])

.controller('RegisterCtrl', function($scope, $state) {

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

            console.log('hahaha')
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
            mornReminder: "8.30",
            afternoonReminder: "13.30",
            eveReminder: "18.00",
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
        medicineList = {
            m: {},
            a: {},
            e: {},
            n: {}
        };

    var userRef = firebaseRef.child("patients").child(authData.uid);

    $scope.prescriptions = [];

    var todayTimeStamp = $scope.todayTimeStamp = new Date().getTime();

    userRef.child('visits').startAt(todayTimeStamp).on("value", function(snapshot) {
        $scope.arrMedicines = [];
        var medicines = snapshot.val();
        for (var key in medicines) {
            var med = medicines[key];
            var startDate = med.startDate;
            var cycle = med.duration;
            var frequency = med.frequency;
            var medDate = null;

            for (i = 0; i < cycle; i++) {
                if (i == 0) {
                    medDate = startDate
                } else {
                    medDate = $TimeService.getFutureDate(startDate, frequency);
                    frequency += med.frequency;
                }

                $scope.arrMedicines.push({
                    name: med.name,
                    morning: med.dosage.morning,
                    afternoon: med.dosage.afternoon,
                    evening: med.dosage.evening,
                    night: med.dosage.night,
                    medDate: $TimeService.getDateFromTimeStamp(medDate)
                })


            }
        }
        $scope.$apply();
    });

    $scope.getDate = function(timeStamp) {
        var date = new Date(timeStamp)
        return (date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear());
    }

    // for (var key in doctorsData) {
    //     if (doctorsData.hasOwnProperty(key)) {
    //         var prescriptions = doctorsData[key].prescriptions;
    //          for (var presKey in prescriptions) {
    //                 $scope.prescriptions.push(prescriptions[presKey]);
    //          }
    //     }
    // }

    // console.log($scope.prescriptions);

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
    $scope.times = medicineTimes;
    $scope.increment = 1;

    $scope.medicineAdd = function(val, time) {
        $scope.times[time] = val;
    }

    $scope.addMedicine = function() {

        var medData = $scope.data,
            medName = medData.medicine,
            startingFrom = parseInt(medData.startDate),
            startDate = $TimeService.getFutureDateFromToday(startingFrom),
            frequency = parseInt(medData.frequency),
            duration = parseInt(medData.duration),
            endDate = $TimeService.getFutureDateFromToday((startingFrom + frequency) * duration),
            endDateTimeStamp = $TimeService.getTimeStampFromDate(endDate),
            bAddTohistory = medData.medhistory;


        userRef.child('visits').push({
            name: medName,
            startDate: $TimeService.getTimeStampFromDate(startDate),
            frequency: frequency,
            dosage: medicineTimes,
            duration: duration,
            endDate: endDateTimeStamp,
            addToHistory: bAddTohistory
        }).setPriority(endDateTimeStamp);

        console.log('added')
    }




})
