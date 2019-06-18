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
        content_setup();
    }
    /******** Called once jQuery has loaded ******/
    function scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);
        // Call our main function
        content_setup();
    }

    // show message (debug only)
    function showMessage(topic, text) {
        //console.log(topic + ": ", text);
    }

    /******** Content Setup function ********/
    function content_setup() {
        showMessage("content_setup", "initial");
        //initialize with document ready function
        jQuery(document).ready(function($) {
            showMessage("document", "ready");
            let auth_token = null;
            // JavaScript code to GET and SET cookies :: END
            showMessage("pageLoad()", "call");
            // calling code on load to check user code got token or not
            pageLoad();

            // obtaining user action and checking (is user valid?)
            $("a").click(function(event) {
                //getting current clicked anchor
                let $elem = $(this);
                let controlVerified = verifyControl($elem);
                // if class exists
                if (controlVerified === true) {
                    //preventing default action on specific anchor tab click
                    event.preventDefault();
                    checkUserValidation(0, $(this).attr(constants.HREF), (typeof $(this).attr(constants.TARGET) == undefined || $(this).attr(constants.TARGET) == null) ? constants.PARENT : $(this).attr(constants.TARGET));
                }
            });

            function verifyControl($elem) {
                let controlVerified = false;
                // comparing with current element classes
                if (typeof constants.ATTAINABLE_CLASS !== undefined && constants.ATTAINABLE_CLASS !== null && constants.ATTAINABLE_CLASS.length > 0) {
                    $.each(constants.ATTAINABLE_CLASS, function(index, attainableClass) {
                        // checking "attainable_class" variable contain dot (.) with class.
                        //if yes, then remove it
                        if (attainableClass.charAt(0) === ".") {
                            attainableClass = attainableClass.substr(1);
                        }
                        // comparing if current element have specified class
                        if ($elem.hasClass(attainableClass) === true) {
                            controlVerified = true;
                        }
                    });
                }
                // comparing with parent classes
                if (controlVerified === false && typeof constants.ATTAINABLE_PARENT_CLASS !== undefined && constants.ATTAINABLE_PARENT_CLASS !== null && constants.ATTAINABLE_PARENT_CLASS.length > 0) {
                    $.each(constants.ATTAINABLE_PARENT_CLASS, function(index, attainableParent) {
                        // checking "attainable_class" variable contain dot (.) with class.
                        //if yes, then remove it
                        if (attainableParent.charAt(0) === ".") {
                            attainableParent = attainableParent.substr(1);
                        }
                        // comparing if current element parents have specified class
                        if ($elem.parents().hasClass(attainableParent) === true) {
                            controlVerified = true;
                        }
                    });
                }
                return controlVerified;
            }

            function checkUserValidation(isPage, pageUrl, _target) {
                console.log("isPage:", isPage);
                //checking if token has not been check before then fill below object
                if (!helper.checkNotNull(auth_token)) {
                    auth_token = cookie.getCookie(constants.TOKEN);

                    // Check user login status
                    if (isPage === 0) {

                        console.log("token: ", auth_token);
                        let ak = helper.api_key;
                        let distID = helper.dist_id();
                        console.log("distID,", distID);
                        // let url = constants.DETAIL_BY_TOKEN_URL.replace("[ak]", ak).replace("[di]", helper.dist_id).replace("[token]", token);
                        let url = constants.BASE_API_URL + "/api/auth/postcheckuser?token=" + encodeURIComponent(auth_token) + "&distID=" + encodeURIComponent(distID);
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
                                    if (!helper.checkNotNull(parsedObj.COLUMNS)) {
                                        helper.deleteToken();
                                        console.log("helper.getToken():", helper.getToken());
                                        auth_token = "";
                                        if (!(window.location.href.indexOf(constants.OGA_LOGIN_URL) > -1))
                                            cookie.setCookie(constants.LAST_ACTIVE_PAGE, initial_url, cookie.addDays(cookie.today(), 30));
                                        window.open(constants.OGA_LOGIN_PAGE, constants.PARENT);
                                        return;
                                    }
                                }
                            },
                            error: function(x, y, z) {
                                console.log("Error: ", x, y, z);
                                if (helper.checkNotNull(x) && x.status === 401) {
                                    console.log("You are not authorized");
                                } else {
                                    console.log("Something went wrong. Unable to fetch data.");
                                }
                            }
                        });

                    }
                }
                //saving clicked url in cookie and sending request to validate user
                let initial_url = pageUrl;
                if (!helper.checkNotNullString(auth_token)) {
                    if (!(window.location.href.indexOf(constants.OGA_LOGIN_URL) > -1))
                        cookie.setCookie(constants.LAST_ACTIVE_PAGE, initial_url, cookie.addDays(cookie.today(), 30));
                    window.open(constants.OGA_LOGIN_PAGE, constants.PARENT);
                } else if (isPage === 1) {
                    //
                } else {
                    //if user is already validated then go directly to action page
                    window.open(initial_url, _target);
                }
                updateUserStatus();
            }

            // function to check user got token or not
            function pageLoad() {
                showMessage("page_Load", "inital");
                // getting current page url and comparing with anchor tag that contains same class
                let href = window.location.href;
                // The first argument is the index, the second is the element
                $("a").each(function(index, element) {
                    if ($(element).attr(constants.HREF) == href) {
                        if (verifyControl($(element)) === true) {
                            checkUserValidation(1, href, (typeof $(element).attr(constants.TARGET) == undefined || $(element).attr(constants.TARGET) == null) ? constants.PARENT : $(element).attr(constants.TARGET));
                            return;
                        }
                    }
                });
                updateUserStatus();
            }

            function updateUserStatus() {
                let logged = false;
                //Get and check user cookies exist or not
                auth_token = cookie.getCookie(constants.TOKEN);
                if (typeof auth_token !== undefined && auth_token != null && auth_token.trim().length > 0) {
                    logged = true;
                }

                // Remove li.list-current-status if already exists
                $("ul.social-menu").find("li.list-current-status").remove();

                // Add li.list-current-status with user status
                let listTag = document.createElement("li");
                listTag.setAttribute("class", "menu-item menu-item-type-custom menu-item-object-custom list-current-status");

                // Add Login and Logout button to take desired action
                let actionButton = document.createElement("a");
                actionButton.setAttribute("class", "og-user-status");
                actionButton.setAttribute("href", "");
                // If user is log
                actionButton.innerText = helper.logText(logged);
                listTag.appendChild(actionButton);
                $("header").find("ul#menu-top-header").append(listTag);
                $("header").find("ul#menu-top-header-spanishus").append(listTag);
                $("header").find("ul#menu-top-header-chinese-us").append(listTag);
                $("header").find("ul#menu-top-header-english-canada").append(listTag);
                $("header").find("ul#menu-top-header-french-canada").append(listTag);
                $("header").find("ul#menu-top-header-chinese-canada").append(listTag);
                $("header").find("ul#menu-top-header-italian").append(listTag);
                $("header").find("ul#menu-top-header-germany-german").append(listTag);
                $("header").find("ul#menu-top-header-thai-thailand").append(listTag);
                $("header").find("ul#menu-top-header-hk").append(listTag);

                $("a.og-user-status").on("click", function(event) {
                    event.preventDefault();
                    let auth_token = cookie.getCookie(constants.TOKEN);
                    if (typeof auth_token === undefined || auth_token === null || auth_token.trim().length === 0) {
                        checkUserValidation(0, window.location.href, constants.PARENT);
                    } else {
                        //Checking and removing existing cookies
                        if (cookie.getCookie(constants.TOKEN) !== null) {
                            cookie.deleteCookie(constants.TOKEN);
                        }
                        window.open(helper.getBaseUrl(), constants.TOP);
                        return;
                    }
                });
            }
        });
    }
});