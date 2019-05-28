var cookie = {
    tokenHeader: 'Token',
    dateFormat: 'yyyy-MM-dd hh:mm:ss',
    today: function() {
        return new Date();
    },
    toDate: function(date) {
        date = new Date(date);
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();

        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();

        return new Date(year, month, day, hour, minute, second);
    },
    setCookie: function(name, value, expiry) {
        document.cookie = name + "=" + escape(value) + "; path=/; expires=" + String(expiry);
    },

    getCookie: function(name) {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(document.cookie);
        var returnObject = (value !== null) ? unescape(value[1]) : null;
        var val = returnObject;
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
        var result = "";
        if (typeof array !== 'undefined' && array !== null)
            for (var i = 0; i < array.length; i++) {
                for (var j = 0; j < array[i].length; j++)
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