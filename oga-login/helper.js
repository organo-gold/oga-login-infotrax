"use strict"

let helper = {

    checkNotNull: (data) => {
        return Boolean(data !== undefined && typeof data !== undefined && data != null);
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

    api_key: () => {
        let c_apiKey = cookie.getCookie(constants.API_KEY);
        return cookie.DecodeString(c_apiKey);
    },

    dist_id: () => {
        let c_distID = cookie.getCookie(constants.DIST_ID);
        return cookie.DecodeString(c_distID);
    },

    setToken: (token) => {
        cookie.setCookie(constants.TOKEN, token, cookie.addDays(cookie.today(), 30));
    },
    getToken: () => cookie.getCookie(constants.TOKEN),
    deleteToken: () => {
        cookie.deleteCookie(constants.TOKEN)
    },

    redirectActivePage: () => cookie.getCookie(constants.LAST_ACTIVE_PAGE)
};