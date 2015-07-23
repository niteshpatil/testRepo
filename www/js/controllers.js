angular.module('starter.controllers', ['firebase', 'angular.filter'])

.controller('RegisterCtrl', function($scope, $state, fireBaseData) {
    var firebaseRef = fireBaseData.ref(),
        authData = firebaseRef.getAuth();

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

        userRef.child('settings').child('buffer').set({
            beforeMealBuffer: 60,
            snoozTime: 10
        });

        userRef.child('settings').child('reminders').set({
            morningReminder: "8.30",
            afternoonReminder: "13.30",
            eveningReminder: "18.00",
            nightReminder: "21.00"

        });

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
        prevAlarmTime = null,
        nextAlarmTime = null,
        nextAlarm = null,
        curTime = new Date().getTime(),
        userRef = firebaseRef.child("patients").child(authData.uid),
        //  todayMeds = {},
        joinPrescriptions = null,
        unSortedMeds = {};

    var todayTimeStamp = prevAlarmTime = $scope.todayTimeStamp = new Date().setHours(0, 0, 0, 0);
    //todayMeds[todayTimeStamp] = [];

    var joinPrescriptions = function(prescriptions) {
        var arrMedicines = [];
        for (var key in prescriptions) {

            for (var mId in prescriptions[key]) {
                prescriptions[key][mId].prescriptionId = key;
                prescriptions[key][mId].medId = mId;
                arrMedicines.push(prescriptions[key][mId]);
            }

        }
        return arrMedicines;
    };

    $scope.getDateFromat = function(timeStamp) {
        var date = new Date(parseInt(timeStamp));
        return date.toDateString(); //(date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
    }

    var calculateNextAlarm = function(notifications) {
        var arrTimestamps = [],
            structTimes = {
                "0": "morning",
                "1": "afternoon",
                "2": "evening",
                "3": "night"
            }
        for (var key in notifications) {
            var hours = notificationTimings[key].split('.')[0];
            var minutes = notificationTimings[key].split('.')[1];
            var alarmTime = new Date(todayTimeStamp).setHours(hours, minutes, 0, 0);
            arrTimestamps.push(alarmTime);
        }
        arrTimestamps.sort();

        for (var i = 0; i < arrTimestamps.length; i++) {
            if (curTime < arrTimestamps[i]) {
                nextAlarmTime = arrTimestamps[i];
                nextAlarm = structTimes[i];
                break;
            } else {
                prevAlarmTime = arrTimestamps[i];
            }
        }

    }

    userRef.child('settings/reminders').on('value', function(snapshot) {
        notificationTimings = snapshot.val();
        calculateNextAlarm(notificationTimings);
        console.log("next :" + new Date(nextAlarmTime) + "  Prev : " + new Date(prevAlarmTime));
    })

    userRef.child('visits').startAt(todayTimeStamp).on("value", function(snapshot) {
        var allmeds = snapshot.val(),
            medicines = joinPrescriptions(allmeds),
            startDate = null,
            cycle = null,
            frequency = null,
            medDate = null,
            medDateMidnight = null,
            medicine = null,
            objMedicine = null,
            dosage = null;

        unSortedMeds = {};
        $scope.arrMedicines = [];

        for (var i = 0; i < medicines.length; i++) {
            objMedicine = {};
            medicine = medicines[i];
            startDate = medicine.startDate;
            cycle = medicine.duration;
            frequency = medicine.frequency;
            dosage = medicine.dosage;

            if (medicine.endDate < todayTimeStamp) {
                continue;
            }

            for (var j = 0; j < cycle; j++) {
                if (j == 0 && startDate == todayTimeStamp) {
                    medDate = todayTimeStamp;
                } else {
                    medDate = $TimeService.getFutureDate(startDate, frequency);
                    medDate = $TimeService.getTimeStampFromDate(medDate);
                    frequency += medicine.frequency;
                }

                if (medDate < todayTimeStamp) {
                    continue;
                }

                //medDate = new Date(medDate).setHours(hours, minutes, 0, 0);
                medDateMidnight = new Date(medDate).setHours(0, 0, 0, 0)

                objMedicine = {
                    date: medDate,
                    name: medicine.name,
                    morning: medicine.dosage.morning,
                    afternoon: medicine.dosage.afternoon,
                    evening: medicine.dosage.evening,
                    night: medicine.dosage.night,

                    medDate: medDateMidnight,
                    medDirection: medicine.medDirection,
                    prescriptionId: medicine.prescriptionId,
                    medicineId: medicine.medId
                }

                if (medicine.dosage.asneeded > 0) {
                    objMedicine.asneeded = medicine.dosage.asneeded;
                }

                if (!unSortedMeds[medDate]) {
                    unSortedMeds[medDate] = [];
                }

                unSortedMeds[medDate].push(objMedicine);


            }

        }


        var medicineList = [];

        if (!unSortedMeds[todayTimeStamp]) {
            return false;
        }

        var swapCounter = 0;
        for (var i = 0; i < unSortedMeds[todayTimeStamp].length; i++) {
            var medicineArray = unSortedMeds[todayTimeStamp];
            var medicine = medicineArray[i];

            if (medicine[nextAlarm] > 0) {
                medicine.nextmed = true;
                medicine.dose = nextAlarm;
                medicineArray.move(i, 0);
                swapCounter++;
            }

        }

        for (var date in unSortedMeds) {

            for (var i = 0; i < unSortedMeds[date].length; i++) {
                medicineList.push(unSortedMeds[date][i]);
            }

        }

        $scope.arrMedicines = medicineList;

        setTimeout(function() {
            $scope.$apply();
            document.getElementById('med-loader').style.display = "none";
        }, 100);

    });



})

.controller('TabsPageController', function($scope, $state) {

})

.controller('doctorsController', function($scope, $state) {

})

.controller('AddMedicineController', function($scope, $state, fireBaseData, $TimeService, $DataService, $ionicPopup) {
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
    $scope.data.medDirection = "After Meal";
    var MedicineArray = [];

    $scope.medicineAdd = function(val, time) {
        $scope.data.dosage[time] = val;
    }

    $scope.setMedDirection = function(directions) {

        setTimeout(function() {
            $scope.$apply(function() {
                $scope.data.medDirection = directions;

            });
        }, 200);
    }

    var noMedDetailsAlert = function() {
        $ionicPopup.alert({
            title: "Add Medicine",
            template: "Please add complete medicine details !!!"
        });
    }

    var validateForm = function() {

        if (!$scope.data.medicine) {

            return false;
        } else if ($scope.data.dosage.morning == 0 && $scope.data.dosage.afternoon == 0 && $scope.data.dosage.evening == 0 && $scope.data.dosage.night == 0) {
            if ($scope.data.dosage.asneeded > 0) {
                return true;
            }
            return false;

        } else {
            return true
        }
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

        if (MedicineArray.length == 0) {
            if (!validateForm()) {
                noMedDetailsAlert();
                return false;
            } else {
                MedicineArray.push({
                    name: medName,
                    startDate: $TimeService.getTimeStampFromDate(startDate),
                    frequency: frequency,
                    dosage: $scope.data.dosage,
                    duration: duration,
                    endDate: endDateTimeStamp,
                    medDirection: $scope.data.medDirection

                });
            }
        } else {
            if (validateForm()) {
                MedicineArray.push({
                    name: medName,
                    startDate: $TimeService.getTimeStampFromDate(startDate),
                    frequency: frequency,
                    dosage: $scope.data.dosage,
                    duration: duration,
                    endDate: endDateTimeStamp,
                    medDirection: $scope.data.medDirection

                });
            }

        }

        //  bAddTohistory = medData.medhistory;
        // var len = null,

        // prescriptionId = userRef.child('visits').push().key()


        // for (var i = 0, len = MedicineArray.length; i < len; i++) {

        // }

        userRef.child('visits').push(MedicineArray, function() {
            $state.go('app.tabs.medicines');
        }).setPriority(endDateTimeStamp);


        MedicineArray = [];

        $scope.data = {
            dosage: {
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0
            },
            duration: 1,
            startDate: 0,
            frequency: 1,
            medDirection: "After Meal"
        };

        $scope.resetValues();
    }

    $scope.addToPrescription = function() {
        var medData = $scope.data,
            medName = medData.medicine,
            startingFrom = parseInt(medData.startDate),
            startDate = $TimeService.getFutureDateFromToday(startingFrom),
            frequency = parseInt(medData.frequency),
            duration = parseInt(medData.duration),
            endDate = $TimeService.getFutureDateFromToday((startingFrom + frequency) * duration),
            endDateTimeStamp = $TimeService.getTimeStampFromDate(endDate);

        if(!validateForm()) {
            noMedDetailsAlert();
            return false;
        }

        MedicineArray.push({
            name: medName,
            startDate: $TimeService.getTimeStampFromDate(startDate),
            frequency: frequency,
            dosage: $scope.data.dosage,
            duration: duration,
            endDate: endDateTimeStamp,
            medDirection: $scope.data.medDirection

        })

        $scope.data = {
            dosage: {
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0
            },
            duration: 1,
            startDate: 0,
            frequency: 1,
            medDirection: "After Meal"
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
                    $scope.medicineAdd(newScope.value, newScope.time);

                });
            }, 100)
        }
    }



})

.controller('medDetailsController', function($scope, $state, $stateParams, fireBaseData, $TimeService) {
    var prescriptionId = $stateParams.prescriptionid,
        medicineId = $stateParams.medicineid,
        firebaseRef = fireBaseData.ref(),
        authData = firebaseRef.getAuth(),
        userRef = firebaseRef.child("patients").child(authData.uid);

    userRef.child('visits').child(prescriptionId).child(medicineId).once('value', function(snapshot) {
        var medData = snapshot.val();
        $scope.medicine = medData.name;
        $scope.dose = {};
        $scope.dose.morning = medData.dosage.morning;
        $scope.dose.afternoon = medData.dosage.afternoon;
        $scope.dose.evening = medData.dosage.evening;
        $scope.dose.night = medData.dosage.night;
        if (medData.dosage.asneeded > 0) {
            $scope.dose.asneeded = medData.dosage.asneeded;
        }
        setTimeout(function() {
            $scope.$apply();
        }, 100);
    });



    $scope.deleteMedicine = function() {
        userRef.child('visits').child(prescriptionId).child(medicineId).set(null);
        $state.go('app.tabs.medicines');
    }
})


.controller('LogoutCtrl', function($scope, $state, $ionicHistory, fireBaseData) {

    $scope.logout = function() {
        var firebaseRef = fireBaseData.ref();
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        firebaseRef.unauth();
        $state.go('register');
    }
})
