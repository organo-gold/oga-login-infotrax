"use strict"

let helper = {

    checkNotNull: (data) => {
        return Boolean(typeof data !== undefined && data != null);
    },

    checkNotNullString: (str) => {
        return helper.checkNotNull(str) && Boolean(str.trim().length > 0);
    },

    // base URL of current page/form
    getBaseUrl: function() {
        let pathArray = location.href.split("/");
        let protocol = pathArray[0];
        let host = pathArray[2];
        let url = protocol + "//" + host;
        return url;
    },

    // Getting query string value by key name
    getQueryString: function(name) {
        let vars = [],
            hash;
        let hashes = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
        for (let i = 0; i < hashes.length; i++) {
            hash = hashes[i].split("=");
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars[name];
    },

    // Removing query string from url
    removeQueryString: function() {
        history.pushState(null, "", location.href.split("?")[0]);
    },

    logText: (logged) => Boolean(logged) ? constants.LOGOUT : constants.LOGIN,
};