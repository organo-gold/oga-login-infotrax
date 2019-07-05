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
        let token = helper.getToken();
        if (helper.checkNotNull(token)) {
            authForm.getUserByToken(token);
        }
        authForm.hideLoader();
        $('body').find('li.list-current-status').addClass("hide");
    },

    authenticate: function() {
        authForm.showLoader();
        if (authForm.validate()) {
            let ak = helper.api_key();
            let ds = $("input[name=idistributor]").val();
            let pw = $("input[name=ipassword]").val();
            let url = constants.USER_AUTH_URL.replace("[ak]", ak).replace("[ds]", ds).replace("[pw]", pw);
            //let url = constants.BASE_API_URL + "/api/auth/post?username=" + encodeURIComponent(ds) + "&password=" + encodeURIComponent(pw);
            console.log("auth_url: ", url);
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                success: function(response) {
                    console.log("response:", response);
                    if (helper.checkNotNull(response)) {
                        console.log("checkNotNull:", "inside");
                        let stringified = JSON.stringify(response);
                        console.log("stringified:", stringified);
                        let parsedObj = JSON.parse(stringified);
                        console.log("parsedObj:", parsedObj);
                        console.log("parsedObj.SESSION:", parsedObj.SESSION);
                        console.log("parsedObj.SESSION if():", helper.checkNotNull(parsedObj.SESSION));
                        console.log("parsedObj.SESSION if(string):", helper.checkNotNullString(parsedObj.SESSION));
                        if (helper.checkNotNullString(parsedObj.SESSION)) {
                            console.log("session:", "if");
                            helper.setToken(parsedObj.SESSION);
                            cookie.setCookie(constants.DIST_ID, cookie.EncodeString(ds), cookie.addDays(cookie.today(), 30));
                            authForm.getUserByToken(parsedObj.SESSION);
                        } else {
                            console.log("session:", "else");
                            helper.deleteToken();
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
                done: function(response) {
                    console.log("done: ", response);
                },
                error: function(x, y) {
                    console.log("Error(x): ", x);
                    console.log("Error(y): ", y);
                    if (helper.checkNotNull(x) && x.status === 401) {
                        authForm.showMessage("You are not authorized");
                    } else {
                        authForm.showMessage("Something went wrong. Unable to fetch data." + x);
                    }
                    authForm.hideLoader();
                }
            });
        }
    },

    getUserByToken: function(token) {
        console.log("token: ", token);
        let ak = helper.api_key();
        let distID = helper.dist_id();
        console.log('ak:', ak);
        console.log('distID:', distID);
        let url = constants.DETAIL_BY_TOKEN_URL.replace("[ak]", encodeURIComponent(ak)).replace("[di]", encodeURIComponent(distID)).replace("[token]", encodeURIComponent(token));
        //let url = constants.BASE_API_URL + "/api/auth/postcheckuser?token=" + encodeURIComponent(token) + "&distID=" + encodeURIComponent(distID);
        console.log("getUserByToken(): ", url);
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            success: function(response) {
                console.log("response 2: ", response);
                if (helper.checkNotNull(response)) {
                    let stringified = JSON.stringify(response);
                    let parsedObj = JSON.parse(stringified);
                    console.log("parsedObj.COLUMNS: ", parsedObj.COLUMNS);
                    if (helper.checkNotNull(parsedObj.COLUMNS)) {
                        // CONTINUE
                        console.log("VALIDATED");

                        let redirectPage = helper.redirectActivePage();
                        if (!helper.checkNotNullString(redirectPage)) {
                            redirectPage = helper.getQueryString(constants.CALLBACK);
                        }
                        if (!helper.checkNotNullString(redirectPage)) {
                            redirectPage = constants.HOME_PAGE;
                        }
                        window.open(redirectPage, constants.PARENT);
                    } else {
                        helper.deleteToken();
                        // {"MESSAGE":"Validation Error","DETAIL":"Not Authorized to run this service","TIMESTAMP":"05/27/2019 15:49:03","ERRORCODE":"904"}
                        if (helper.checkNotNull(parsedObj.DETAIL)) {
                            authForm.showMessage(parsedObj.DETAIL);
                        } else {
                            authForm.showMessage("Authentication failed!");
                        }
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

        $('body').find('button[type=button].user-sign').click(function() {
            authForm.authenticate();
        });
        $('body').find('button[type=reset].user-sign').click(function() {
            authForm.formReset();
        });

        $("input[name=idistributor]").keypress(function(e) {
            authForm.enterEvent(e);
        });

        $("input[name=ipassword]").keypress(function(e) {
            authForm.enterEvent(e);
        });

        cookie.setCookie(constants.API_KEY, cookie.EncodeString("O3962162"), cookie.addHours(cookie.today(), 12));
        //helper.deleteToken();
        authForm.checkAuth();
    },

    showLoader: function() {
        $('body').find('button[type=button].user-sign').addClass('disabled');
        $('body').find('input[name=idistributor]').addClass('disabled');
        $('body').find('input[name=ipassword]').addClass('disabled');
        $('.loading-results').removeClass("hide");
    },

    hideLoader: function() {
        $('body').find('button[type=button].user-sign').removeClass('disabled');
        $('body').find('input[name=idistributor].reset-form').removeClass('disabled');
        $('body').find('input[name=ipassword]').removeClass('disabled');
        $('.loading-results').addClass("hide");
    },

    enterEvent: (e) => {
        let key = e.which;
        if (key == 13) // the enter key code
        {
            $('body').find('button[type=button].user-sign').click();
            return false;
        }
    },
};