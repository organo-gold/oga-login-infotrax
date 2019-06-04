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
        if (helper.checkNotNull(token)) {
            authForm.getUserByToken(token, authForm.api_key);
        }
        authForm.hideLoader();
    },

    authenticate: function() {
        authForm.showLoader();
        if (authForm.validate()) {
            let ak = authForm.api_key;
            let ds = $("input[name=idistributor]").val();
            let pw = $("input[name=ipassword]").val();
            //let url = constants.USER_AUTH_URL.replace("[ak]", ak).replace("[ds]", ds).replace("[pw]", pw);
            let url = "http://api.oghq.ca/api/auth/post?username=" + ds + "&password=" + pw;
            console.log("auth_url: ", url);
            $.ajax({
                url: url,
                type: "POST",
                dataType: "text",
                success: function(response) {
                    console.log("response: ", response);
                    if (helper.checkNotNull(response)) {
                        let stringified = JSON.stringify(response);
                        let parsedObj = JSON.parse(stringified);
                        if (helper.checkNotNullString(parsedObj.SESSION)) {
                            authForm.setToken(parsedObj.SESSION);
                            authForm.getUserByToken(parsedObj.SESSION, ak);
                        } else {
                            authForm.deleteToken();
                            // { "MESSAGE": "Login Error", "DETAIL": "Invalid user", "TIMESTAMP": "05/27/2019 15:18:56", "ERRORCODE": "902" };
                            if (helper.checkNotNull(parsedObj.DETAIL)) {
                                authForm.showMessage(parsedObj.DETAIL);
                            } else {
                                authForm.showMessage("Authentication failed!");
                            }
                            return;
                        }
                    }
                    authForm.hideLoader();
                },
                error: function(x, y, z) {
                    console.log("Error(x): ", x);
                    console.log("Error(y): ", y);
                    if (helper.checkNotNull(x) && x.status === 401) {
                        authForm.showMessage("You are not authorized");
                    } else {
                        authForm.showMessage("Something went wrong. Unable to fetch data.");
                    }
                    authForm.hideLoader();
                }
            });


            // authForm.showLoader();
            // if (authForm.validate()) {
            //     let ak = authForm.api_key;
            //     let ds = $("input[name=idistributor]").val();
            //     let pw = $("input[name=ipassword]").val();
            //     let url = constants.USER_AUTH_URL.replace("[ak]", ak).replace("[ds]", ds).replace("[pw]", pw);
            //     console.log("auth_url: ", url);
            //     jQuery.support.cors = true;
            //     $.ajax({
            //         url: url,
            //         type: "POST",
            //         dataType: "application/json",
            //         headers: {
            //             "Content-Type": "application/json"
            //         },
            //         success: function(response) {
            //             console.log("response: ", response);
            //             if (helper.checkNotNull(response)) {
            //                 let stringified = JSON.stringify(response);
            //                 let parsedObj = JSON.parse(stringified);
            //                 if (helper.checkNotNullString(parsedObj.SESSION)) {
            //                     authForm.setToken(parsedObj.SESSION);
            //                     authForm.getUserByToken(parsedObj.SESSION, ak);
            //                 } else {
            //                     authForm.deleteToken();
            //                     // { "MESSAGE": "Login Error", "DETAIL": "Invalid user", "TIMESTAMP": "05/27/2019 15:18:56", "ERRORCODE": "902" };
            //                     if (helper.checkNotNull(parsedObj.DETAIL)) {
            //                         authForm.showMessage(parsedObj.DETAIL);
            //                     } else {
            //                         authForm.showMessage("Authentication failed!");
            //                     }
            //                     return;
            //                 }
            //             }
            //             authForm.hideLoader();
            //         },
            //         done: function(response) {
            //             console.log("done: ", response);
            //         },
            //         success: function(s) {
            //             console.log("success: ", s);
            //         },
            //         error: function(x, y) {
            //             console.log("Error(x): ", x);
            //             console.log("Error(y): ", y);
            //             if (helper.checkNotNull(x) && x.status === 401) {
            //                 authForm.showMessage("You are not authorized");
            //             } else {
            //                 authForm.showMessage("Something went wrong. Unable to fetch data.");
            //             }
            //             authForm.hideLoader();
            //         },
            //     });
        }
    },

    getUserByToken: function(token, ak) {
        console.log("token: ", token);
        let url = "http://api.oghq.ca/api/auth/postcheckuser?token=" + token;
        console.log("getUserByToken(): ", url);
        $.ajax({
            url: url,
            type: "POST",
            dataType: "text",
            success: function(response) {
                console.log("response 2: ", response);
                if (helper.checkNotNull(response)) {
                    let stringified = JSON.stringify(response);
                    let parsedObj = JSON.parse(stringified);
                    console.log("parsedObj.COLUMNS: ", parsedObj.COLUMNS);
                    if (helper.checkNotNull(parsedObj.COLUMNS)) {
                        // CONTINUE
                        console.log("VALIDATED");

                        let redirectPage = helper.getQueryString(constants.CALLBACK);
                        if (!helper.checkNotNullString(redirectPage)) {
                            redirectPage = constants.HOME_PAGE;
                        } else {
                            redirectPage = authForm.redirectActivePage();
                        }
                        if (!helper.checkNotNullString(redirectPage)) {
                            redirectPage = constants.HOME_PAGE;
                        }
                        console.log("redirectPage: ", redirectPage);
                        window.open(redirectPage, "_parent");
                    } else {
                        authForm.deleteToken();
                        // {"MESSAGE":"Validation Error","DETAIL":"Not Authorized to run this service","TIMESTAMP":"05/27/2019 15:49:03","ERRORCODE":"904"}
                        if (helper.checkNotNull(parsedObj.DETAIL)) {
                            authForm.showMessage(parsedObj.DETAIL);
                        } else {
                            authForm.showMessage("Authentication failed!");
                        }
                        return;
                    }
                }
                authForm.hideLoader();
            },
            error: function(x, y, z) {
                console.log("Error: ", x, y, z);
                if (helper.checkNotNull(x) && x.status === 401) {
                    authForm.showMessage("You are not authorized");
                } else {
                    authForm.showMessage("Something went wrong. Unable to fetch data.");
                }
                authForm.hideLoader();
            }
        });


        // let url = constants.DETAIL_BY_TOKEN_URL.replace("[ak]", ak).replace("[di]", authForm.dist_id).replace("[token]", token);
        // console.log("getUserByToken(): ", url);
        // jQuery.support.cors = true;
        // $.ajax({
        //     url: url,
        //     type: "GET",
        //     success: function(response) {
        //         console.log("response 2: ", response);
        //         if (helper.checkNotNull(response)) {
        //             let stringified = JSON.stringify(response);
        //             let parsedObj = JSON.parse(stringified);
        //             console.log("parsedObj.COLUMNS: ", parsedObj.COLUMNS);
        //             if (helper.checkNotNull(parsedObj.COLUMNS)) {
        //                 // CONTINUE
        //                 console.log("VALIDATED");

        //                 let redirectPage = helper.getQueryString(constants.CALLBACK);
        //                 if (!helper.checkNotNullString(redirectPage)) {
        //                     redirectPage = constants.HOME_PAGE;
        //                 } else {
        //                     redirectPage = authForm.redirectActivePage();
        //                 }
        //                 if (!helper.checkNotNullString(redirectPage)) {
        //                     redirectPage = constants.HOME_PAGE;
        //                 }
        //                 window.open(redirectPage, "_parent");
        //             } else {
        //                 authForm.deleteToken();
        //                 // {"MESSAGE":"Validation Error","DETAIL":"Not Authorized to run this service","TIMESTAMP":"05/27/2019 15:49:03","ERRORCODE":"904"}
        //                 if (helper.checkNotNull(parsedObj.DETAIL)) {
        //                     authForm.showMessage(parsedObj.DETAIL);
        //                 } else {
        //                     authForm.showMessage("Authentication failed!");
        //                 }
        //                 return;
        //             }
        //         }
        //         authForm.hideLoader();
        //     },
        //     error: function(x, y, z) {
        //         console.log("Error: ", x, y, z);
        //         if (helper.checkNotNull(x) && x.status === 401) {
        //             authForm.showMessage("You are not authorized");
        //         } else {
        //             authForm.showMessage("Something went wrong. Unable to fetch data.");
        //         }
        //         authForm.hideLoader();
        //     }
        // });
    },

    showMessage: function(text) {
        if (helper.checkNotNull(text)) {
            $("div.message").html(text);
            $("div.message").removeClass("hide");
            authForm.hideLoader();
        } else {
            $("div.message").html("");
            $("div.message").addClass("hide");
        }
    },

    validate: function() {
        authForm.formReset();
        let msg = "";
        let isvalid = true;
        let un = $('input[name=idistributor]').val();
        let pw = $('input[name=ipassword]').val();
        if (!helper.checkNotNullString(un)) {
            isvalid = false;
            msg += "Distributor ID is required<br/>";
            $('input[name=idistributor]').parent().parent('.form-group').addClass('has-error');
        }
        if (!helper.checkNotNullString(pw)) {
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

    formSet: function() {

        $('body').find('button[type=button]').click(function() {
            authForm.authenticate();
        });
        $('body').find('button[type=reset]').click(function() {
            authForm.formReset();
        });

        $("input[name=idistributor]").keypress(function(e) {
            authForm.enterEvent(e);
        });

        $("input[name=ipassword]").keypress(function(e) {
            authForm.enterEvent(e);
        });

        cookie.setCookie(constants.API_KEY, cookie.EncodeString("O3962162"), cookie.addHours(cookie.today(), 12));
        cookie.setCookie(constants.DIST_ID, cookie.EncodeString("1000101"), cookie.addHours(cookie.today(), 12));
        //cookie.setCookie(authForm._last_active_page, authForm._homePage, cookie.addHours(cookie.today(), 12));

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

    enterEvent: (e) => {
        let key = e.which;
        if (key == 13) // the enter key code
        {
            $('body').find('button[type=button]').click();
            return false;
        }
    },

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