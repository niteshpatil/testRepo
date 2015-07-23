angular.module('starter.services', [])

.factory('fireBaseData', function($firebase) {
    var ref = new Firebase("https://glaring-heat-1644.firebaseio.com"),
        users = new Firebase("https://glaring-heat-1644.firebaseio.com/users");
    return {
        ref: function() {
            return ref;
        },
        usersRef: function() {
            return users;
        }

    }
})

.factory('$DataService', function() {
    var user = {};
    return {
        getUserData : function() {
            return user;
        },
        setUserData : function(ref) {
            var userData = null;
            ref.on('value',function(snapshot){
                userData = snapshot.val();
            })
            user = userData;
        },
        getDoctorsData : function(){
           // return user.doctors;
        }
    }
})

.factory('$TimeService', function() {
    return {
        getTodaysTimeStamp : function () {
            return new Date().getTime();
        },

        getTimeStampFromDate : function (date) {
            return new Date(date).getTime();
        },

        getDateFromTimeStamp: function(timeStamp, format) {
            var date = new Date(timeStamp),
                dateFormat = format || 'ddmmyy';
            
            switch (dateFormat){
                case 'ddmmyy' :
                    return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());

                case 'mmddyy' :
                    return ((date.getMonth() + 1) + '/' + date.getDate()  + '/' + date.getFullYear());

            }
            
        },

        getFutureDateFromToday:function(offset){ 
            var today = new Date().setHours(0,0,0,0);
            return new Date(today + parseInt(offset) * 24 * 60 * 60 * 1000);
        },

        getFutureDate:function(date, offset){
            var curDate = new Date(date).getTime();
            return new Date(curDate + parseInt(offset) * 24 * 60 * 60 * 1000);
        }

    }
})