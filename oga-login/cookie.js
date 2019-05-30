"use strict"

let cookie = {
    dateFormat: 'yyyy-MM-dd hh:mm:ss',
    today: function() {
        return new Date();
    },
    toDate: function(date) {
        date = new Date(date);
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();

        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();

        return new Date(year, month, day, hour, minute, second);
    },
    setCookie: function(name, value, expiry) {
        document.cookie = name + "=" + escape(value) + "; path=/; expires=" + String(expiry);
    },

    getCookie: function(name) {
        let re = new RegExp(name + "=([^;]+)");
        let value = re.exec(document.cookie);
        let returnObject = (value !== null) ? unescape(value[1]) : null;
        let val = returnObject;
        return val;
    },
    addMinutes: function(dateTime, minutes) {
        return new Date(new Date(dateTime).getTime() + (Number(minutes) * 60 * 1000)); // less 24 hours
    },
    addHours: function(dateTime, hours) {
        return new Date(new Date(dateTime).getTime() + (Number(hours) * 3600 * 1000)); // less 24 hours
    },
    addDays: function(dateTime, days) {
        return new Date(new Date(dateTime).getTime() + Number(days) * 24 * 3600 * 1000); // less 24 hours
    },
    expired: new Date(new Date().getTime() - 24 * 3600 * 1000), // less 24 hours
    deleteCookie: function(name) {
        document.cookie = name + "=null; path=/; expires=" + String(this.expired);
    },
    GetStringFromByteArray: function(array) {
        let result = "";
        if (typeof array !== 'undefined' && array !== null)
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < array[i].length; j++)
                    result += String.fromCharCode(array[i][j]);
            }
        return result;
    },
    EncodeString: function(str) {
        return window.btoa(str);
    },
    DecodeString: function(str) {
        return window.atob(str);
    }
};