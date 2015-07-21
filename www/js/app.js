// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }
    });
})

.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
        .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html"
    })

    .state('app.tabs', {
        url: '/tabs',
        abstract: true,
        views: {
            'menuContent': {
                templateUrl: 'templates/tabs.html'
            }
        }
    })

    
    .state('app.tabs.medicines', {
                url: '/medicines',
                views: {
                    'medicines-tab': {
                        templateUrl: 'templates/medicines.html',
                        controller: 'MyMedicinesController'
                    }
                }
            })

    .state('app.tabs.doctors', {
                url: '/doctors',
                views: {
                    'doctors-tab': {
                        templateUrl: 'templates/doctors.html',
                        controller: 'doctorsController'
                    }
                }
            })

    .state('app.search', {
        url: "/search",
        views: {
            'menuContent': {
                templateUrl: "templates/search.html"
            }
        }
    })

    .state('app.med-detail', {
            url: "/med-detail:prescriptionid/:medicineid",
            views: {
                'menuContent': {
                    templateUrl: "templates/medicine-detail.html",
                    controller: 'medDetailsController'
                }
            }
        })

    .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'RegisterCtrl'
    })

    .state('logout', {
        url: '/logout',
        templateUrl: 'templates/logout.html',
        controller: 'LogoutCtrl'
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })

    .state('signup', {
        url: '/signup',
        templateUrl: 'templates/sign-up.html',
        controller: 'SignUpController'
    })

    .state('add-doctor', {
        url: '/add-doctor',
        templateUrl: 'templates/add-doctor.html'
    })

    .state('add-medicine', {
        url: '/add-medicine',
        templateUrl: 'templates/add-medicine.html',
        controller: 'AddMedicineController'
    })

    .state('profile-details/:email', {
        url: '/profile-details/:email',
        templateUrl: 'templates/profile-details.html',
        controller: 'ProfileDetailsController'
    })

    .state('app.view-profile', {
        url: '/view-profile',
        views: {
            'menuContent': {
                templateUrl: 'templates/view-profile.html',
                controller: 'ViewProfileController'
            }
        }
    })

    .state('app.change-password', {
        url: '/change-password',
        views: {
            'menuContent': {
                templateUrl: 'templates/change-password.html',
                controller: 'ChangePasswordController'
            }
        }
    })

    .state('app.change-email', {
        url: '/change-email',
        views: {
            'menuContent': {
                templateUrl: 'templates/change-email.html',
                controller: 'ChangeEmailController'
            }
        }
    })

    /*.state('app.view-profile', {
        url: '/view-profile',
        templateUrl: 'templates/view-profile.html',
        controller: 'ViewProfileController'       
    })
    .state('app.tabs.change-password', {
        url: '/change-password',
        views: {
            'medicines-tab': {
                templateUrl: 'templates/change-password.html',
                controller: 'ChangePasswordController'
            }
        }
    })*/

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/register');
   //$urlRouterProvider.otherwise("/app/tabs/home");
    //$urlRouterProvider.otherwise('/tab/dash');

});
