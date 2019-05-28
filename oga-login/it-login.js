"use strict"

$(function() {

    // Localize jQuery variable
    let jQuery;
    /******** Load jQuery if not present *********/
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== "3.0.0") {
        let script_tag = document.createElement("script");
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js");
        if (script_tag.readyState) {
            script_tag.onreadystatechange = function() { // For old versions of IE
                if (this.readyState == "complete" || this.readyState == "loaded") {
                    scriptLoadHandler();
                }
            };
        } else {
            script_tag.onload = scriptLoadHandler;
        }
        // Try to find the head, otherwise default to the documentElement
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        // The jQuery version on the window is the one we want to use
        jQuery = window.jQuery;

        // Call our main function
        authForm.formSet();
    }
    /******** Called once jQuery has loaded ******/
    function scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);

        // Call our main function
        authForm.formSet();
    }
});

let authForm = {

    checkAuth: function() {
        authForm.showLoader();
        let token = authForm.getToken();
        if (authForm.checkNotNull(token)) {
            authForm.getUserByToken(token, authForm.ak);
        }
        authForm.hideLoader();
    },

    auth_url: "http://organogold-dts.myvoffice.com/organogold/index.cfm?service=Session.login&apikey=[ak]&DTSPASSWORD=[pw]&DTSUSERID=[ds]&format=json",
    authenticate: function() {
        authForm.showLoader();
        let ak = authForm.ak;
        let ds = $("input[name=idistributor]").val();
        let pw = $("input[name=ipassword]").val();
        let url = authForm.auth_url.replace("[ak]", ak).replace("[ds]", ds).replace("[pw]", pw);
        console.log("auth_url: ", url);
        if (authForm.validate()) {
            jQuery.support.cors = true;
            $.ajax({
                url: url,
                type: "GET",
                dataType: "text",
                success: function(data, res, req) {
                    console.log("data: ", data);
                    console.log("response: ", res);
                    console.log("request: ", req);

                    let result = { "SESSION": "aaba56ac-de0c-46b8-8dbc-02ea55f0218c", "LOAD": 1, "ROLES": "distributor" };
                    if (authForm.checkNotNull(result)) {
                        let stringified = JSON.stringify(result);
                        let parsedObj = JSON.parse(stringified);
                        if (authForm.checkNotNullString(parsedObj.SESSION)) {
                            authForm.setToken(parsedObj.SESSION);
                            authForm.getUserByToken(parsedObj.SESSION, ak);
                        } else {
                            authForm.deleteToken();
                            // { "MESSAGE": "Login Error", "DETAIL": "Invalid user", "TIMESTAMP": "05/27/2019 15:18:56", "ERRORCODE": "902" };
                            if (authForm.checkNotNull(parsedObj.DETAIL)) {
                                authForm.showMessage(parsedObj.DETAIL);
                            } else {
                                authForm.showMessage("You are not authorized");
                            }
                            return;
                        }
                    }
                    authForm.hideLoader();
                },
                error: function(x, y, z) {
                    console.log("Error: ", x, y, z);
                    if (authForm.checkNotNull(x) && x.status === 401) {
                        $('.div-message').text("You are not authorized");
                    } else {
                        $('.div-message').text("Something went wrong. Unable to fetch data.");
                    }
                    authForm.hideLoader();
                }
            });
        }
    },

    user_url: "http://organogold-dts.myvoffice.com/organogold/index.cfm?jsessionid=[token]&service=Genealogy.distInfoBySavedQuery&apikey=[ak]&QRYID=DistConfData&DISTID=[di]&APPNAME=Admin&GROUP=Reports&format=JSON&fwreturnlog=1",
    getUserByToken: function(token, ak) {
        console.log("token: ", token);
        let url = authForm.user_url.replace("[ak]", ak).replace("[di]", authForm.di).replace("[token]", token);
        console.log("getUserByToken(): ", url);
        jQuery.support.cors = true;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "text",
            success: function(data, res, req) {
                console.log("data: ", data);
                console.log("response: ", res);
                console.log("request: ", req);

                let result = { "ROWCOUNT": 1, "COLUMNS": ["NAME", "CITY", "STATE", "CELL_PHONE", "HOME_PHONE", "NAME2", "EMAIL", "STATUS", "END_RANK", "COU"], "DATA": { "NAME": ["ENTERPRISES SRL, SHANE MORAND"], "CITY": ["Santa Ana"], "STATE": ["SJ"], "CELL_PHONE": ["18888453990"], "HOME_PHONE": ["18888453990"], "NAME2": [""], "EMAIL": ["info@shanemorand.com"], "STATUS": ["D"], "END_RANK": ["15"], "COU": ["CAN"] } };
                if (authForm.checkNotNull(result)) {
                    let stringified = JSON.stringify(result);
                    let parsedObj = JSON.parse(stringified);
                    console.log("parsedObj.COLUMNS: ", parsedObj.COLUMNS);
                    if (authForm.checkNotNull(parsedObj.COLUMNS)) {
                        // CONTINUE
                        console.log("VALIDATED");
                        let redirectPage = authForm._redirectActivePage();
                        if (!authForm.checkNotNullString(redirectPage)) {
                            redirectPage = authForm._homePage;
                        }
                        //window.open(redirectPage, "_parent");
                    } else {
                        authForm.deleteToken();
                        // {"MESSAGE":"Validation Error","DETAIL":"Not Authorized to run this service","TIMESTAMP":"05/27/2019 15:49:03","ERRORCODE":"904"}
                        if (authForm.checkNotNull(parsedObj.DETAIL)) {
                            authForm.showMessage(parsedObj.DETAIL);
                        } else {
                            authForm.showMessage("Invalid User Info");
                        }
                        return;
                    }
                }
                authForm.hideLoader();
            },
            error: function(x, y, z) {
                console.log("Error: ", x, y, z);
                if (authForm.checkNotNull(x) && x.status === 401) {
                    $('.div-message').text("You are not authorized");
                } else {
                    $('.div-message').text("Something went wrong. Unable to fetch data.");
                }
                authForm.hideLoader();
            }
        });
    },

    showMessage: function(text) {
        if (authForm.checkNotNull(text)) {
            $("div.message").html(text);
            $("div.message").removeClass("hidden");
            authForm.hideLoader();
        } else {
            $("div.message").html("");
            $("div.message").addClass("hidden");
        }
    },

    validate: function() {
        authForm.formReset();
        let msg = "";
        let isvalid = true;
        let un = $('input[name=idistributor]').val();
        let pw = $('input[name=ipassword]').val();
        if (!authForm.checkNotNullString(un)) {
            isvalid = false;
            msg += "Distributor ID is required<br/>";
            $('input[name=idistributor]').parent().parent('.form-group').addClass('has-error');
        }
        if (!authForm.checkNotNullString(pw)) {
            isvalid = false;
            msg += "Password is required<br/>";
            $('input[name=ipassword]').parent().parent('.form-group').addClass('has-error');
        }
        authForm.showMessage(msg);
        return isvalid;
    },

    formReset: function() {
        $('input[name=idistributor]').parent().parent('.form-group').removeClass('has-error');
        $('input[name=ipassword]').parent().parent('.form-group').removeClass('has-error');
        authForm.showMessage();
    },

    _apiKey: "_xak__",
    ak: () => {
        let c_apiKey = cookie.getCookie(authForm._apiKey);
        console.log(c_apiKey);
        cookie.DecodeString(c_apiKey);
    },

    _distID: "_xdi__",
    di: () => {
        let c_distID = cookie.getCookie(authForm._distID);
        console.log(c_distID);
        return cookie.DecodeString(c_distID);
    },

    _token: '_xtn__',
    setToken: (token) => {
        cookie.setCookie(authForm._token, token, cookie.addHours(cookie.today(), 12));
    },
    getToken: () => cookie.getCookie(authForm._token),
    deleteToken: () => {
        cookie.deleteCookie(authForm._token)
    },

    _lastActivePage: "_xap__",

    _homePage: "https://ogacademy.staging.wpengine.com/",

    _redirectActivePage: () => cookie.getCookie(authForm._lastActivePage),

    formSet: function() {

        $('body').find('button[type=button]').click(function() {
            authForm.authenticate();
        });
        $('body').find('button[type=reset]').click(function() {
            authForm.formReset();
        });

        cookie.setCookie(authForm._apiKey, cookie.EncodeString("O3962162"), cookie.addHours(cookie.today(), 12));
        cookie.setCookie(authForm._distID, cookie.EncodeString("1000101"), cookie.addHours(cookie.today(), 12));
        //cookie.setCookie(authForm._lastActivePage, authForm._homePage, cookie.addHours(cookie.today(), 12));

        authForm.enterPressEvent();
        authForm.checkAuth();
    },

    showLoader: function() {
        $('body').find('button[type=button]').addClass('disabled');
        $('body').find('input[name=idistributor]').addClass('disabled');
        $('body').find('input[name=ipassword]').addClass('disabled');
        $('.loading-results').removeClass("hide");
    },

    hideLoader: function() {
        $('body').find('button[type=button]').removeClass('disabled');
        $('body').find('input[name=idistributor]').removeClass('disabled');
        $('body').find('input[name=ipassword]').removeClass('disabled');
        $('.loading-results').addClass("hide");
    },

    checkNotNull: (data) => {
        return Boolean(data !== undefined && data != null);
    },

    checkNotNullString: (str) => {
        return authForm.checkNotNull(str) && Boolean(str.trim().length > 0);
    },

    enterPressEvent: () => {
        $("input[name=idistributor]").keypress(function(e) {
            authForm.enterEvent(e);
        });

        $("input[name=ipassword]").keypress(function(e) {
            authForm.enterEvent(e);
        });
    },
    enterEvent: (e) => {
        let key = e.which;
        if (key == 13) // the enter key code
        {
            $('body').find('button[type=button]').click();
            return false;
        }
    }
};