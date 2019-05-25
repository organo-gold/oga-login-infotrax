"use strict"

/********Oauth - Distributor Authentication Script  using Abovegem page  *********/
(function() {
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
        console.log(topic + ": ", text);
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
                    checkUserValidation(0, $(this).attr(constants.href), (typeof $(this).attr(constants.target) == "undefined" || $(this).attr(constants.target) == null) ? constants.parent : $(this).attr(constants.target));
                }
            });

            function verifyControl($elem) {
                let controlVerified = false;
                // comparing with current element classes
                if (typeof constants.attainableCls !== "undefined" && constants.attainableCls !== null && constants.attainableCls.length > 0) {
                    $.each(constants.attainableCls, function(index, attainableCl) {
                        // checking "attainableCls" variable contain dot (.) with class.
                        //if yes, then remove it
                        if (attainableCl.charAt(0) === ".") {
                            attainableCl = attainableCl.substr(1);
                        }
                        // comparing if current element have specified class
                        if ($elem.hasClass(attainableCl) === true) {
                            controlVerified = true;
                        }
                    });
                }
                // comparing with parent classes
                if (controlVerified === false && typeof constants.attainableParentCls !== "undefined" && constants.attainableParentCls !== null && constants.attainableParentCls.length > 0) {
                    $.each(constants.attainableParentCls, function(index, attainableParent) {
                        // checking "attainableCls" variable contain dot (.) with class.
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
                //checking if token has not been check before then fill below object
                if (auth_token === null) {
                    auth_token = cookie.get(constants.access_token_text);
                }
                //saving clicked url in cookie and sending request to validate user
                let initial_url = pageUrl;
                if (typeof auth_token === "undefined" || auth_token === null || auth_token.trim().length === 0) {
                    cookie.set(constants.access_page, initial_url);
                    window.open(constants.oga_login_page, constants.parent);
                } else if (isPage === 1) {
                    // To prevent displaying page then removing later ####################### (3 of 4)
                    //$("body").removeClass("hidden");
                } else {
                    //if user is already validated then go directly to action page
                    window.open(initial_url, _target);
                }
                updateUserStatus();
            }

            // function to check user got token or not
            function pageLoad() {
                showMessage("page_Load", "inital");
                let auth_action_string = queryString.auth_action();
                showMessage("page_Load", "auth_action_string::" + auth_action_string);
                let auth_code = queryString.code();
                showMessage("page_Load", "auth_code::" + auth_code);
                // Comparing user auth token
                if (typeof auth_action_string !== "undefined" && auth_action_string !== null && parseInt(auth_action_string) === 0) {
                    showMessage("page_Load", "auth_action_string::inside");
                    addUserToken(updateUserToken);
                }
                //comparing user login code
                else if (typeof auth_code !== "undefined" && auth_code !== null && auth_code.length > 0) {
                    showMessage("page_Load", "auth_code::inside");
                    /********************* TEMP CODE ::STARTS *****************/
                    temporaryAuth(updateUserToken);
                    /********************* TEMP CODE::ENDS ********************/
                } else {
                    // getting current page url and comparing with anchor tag that contains same class
                    let href = window.location.href;
                    // The first argument is the index, the second is the element
                    $("a").each(function(index, element) {
                        if ($(element).attr(constants.href) == href) {
                            if (verifyControl($(element)) === true) {
                                checkUserValidation(1, href, (typeof $(element).attr(constants.target) == "undefined" || $(element).attr(constants.target) == null) ? constants.parent : $(element).attr(constants.target));
                                return;
                            }
                        }
                    });
                }
                updateUserStatus();
            }

            function temporaryAuth(callback) {
                showMessage("temporaryAuth", "initial");
                /*************** TEMP CODE :: STARTS ***************/
                let token_type = constants.bearer;
                let access_token = basics.Guid();
                let expires_in = constants.expires_in_number;
                let refresh_token = basics.Guid();
                showMessage("temporaryAuth", "after");
                callback(token_type, access_token, expires_in, refresh_token);
                /*************** TEMP CODE :: ENDS ***************/
            }

            function addUserToken(callback) {
                //Getting data from Query String
                let token_type = queryString.token_type();
                let access_token = queryString.access_token();
                let expires_in = queryString.expires_in();
                let refresh_token = queryString.refresh_token();
                callback(token_type, access_token, expires_in, refresh_token);
            }

            function updateUserToken(token_type, access_token, expires_in, refresh_token) {
                showMessage("updateUserToken", "initial");
                //Checking and removing existing cookies
                if (cookie.get(constants.token_type_text) !== null) {
                    cookie.remove(constants.token_type_text);
                }
                if (cookie.get(constants.access_token_text) !== null) {
                    cookie.remove(constants.access_token_text);
                }
                if (cookie.get(constants.expires_in_text) !== null) {
                    cookie.remove(constants.expires_in_text);
                }
                if (cookie.get(constants.refresh_token_text) !== null) {
                    cookie.remove(constants.refresh_token_text);
                }
                //Setting up or adding new cookie
                cookie.set(constants.token_type_text, token_type);
                cookie.set(constants.access_token_text, access_token);
                cookie.set(constants.refresh_token_text, refresh_token);
                showMessage("updateUserToken", "getToken::before");
                auth_token = cookie.get(constants.access_token_text);
                showMessage("updateUserToken", "getToken::after");
                showMessage(auth_token);
                //Removing Query string from url if any
                basics.removeQueryString();
                //Getting page cookie from where user came before redirecting to login page
                showMessage("updateUserToken", "getAccess::before");
                let accessPage = cookie.get(constants.access_page);
                showMessage("updateUserToken", "getAccess::after");
                showMessage(accessPage);
                if (accessPage !== null && accessPage.trim().length !== 0) {
                    //removing page cookie
                    cookie.remove(constants.access_page);
                    //redirecting to corresponding link
                    showMessage("updateUserToken", "redirect::before");
                    window.open(accessPage, constants.parent);
                }
                showMessage("updateUserToken", "finished");
            }

            function updateUserStatus() {
                let logged = false;
                //Get and check user cookies exist or not
                auth_token = cookie.get(constants.access_token_text);
                if (typeof auth_token != "undefined" && auth_token != null && auth_token.trim().length > 0) {
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
                actionButton.innerText = basics.LogText(logged);
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
                    let auth_token = cookie.get(constants.access_token_text);
                    if (typeof auth_token === "undefined" || auth_token === null || auth_token.trim().length === 0) {
                        checkUserValidation(0, window.location.href, constants.parent);
                    } else {
                        //Checking and removing existing cookies
                        if (cookie.get(constants.token_type_text) !== null) {
                            cookie.remove(constants.token_type_text);
                        }
                        if (cookie.get(constants.access_token_text) !== null) {
                            cookie.remove(constants.access_token_text);
                        }
                        if (cookie.get(constants.expires_in_text) !== null) {
                            cookie.remove(constants.expires_in_text);
                        }
                        if (cookie.get(constants.refresh_token_text) !== null) {
                            cookie.remove(constants.refresh_token_text);
                        }
                        window.open(basics.getBaseUrl(), "_top");
                        return;
                    }
                });
            }
        });
    }
})();

const constants = {
    // class name is used to access anchorTAG
    attainableCls: ["og-attainable-button"],
    // class name is used to access parent of anchorTAG
    attainableParentCls: ["og-attainable-menu"],
    // "token type" cookie name
    token_type_text: "__utmt_E520AB15MT_E999",
    // "token id" cookie name
    access_token_text: "__utat_239FE8A9AT_F3F4",
    // "token expires in" cookie name
    expires_in_text: "__utei_95732C2AEI_ADDC",
    // "refresh token name" cookie name
    refresh_token_text: "__utrt_107D4822RT_A28D",
    // "last accessed page" cookie name
    access_page: "__utap_B46DE3ED_F325",
    // callback redirect page
    redirect_url: "http://qa.oghq.ca/SSOCallback/",
    // constant value of
    href: "href",
    // constant value of
    target: "target",
    // constant value of
    parent: "_parent",
    // constant value of
    oga_login_page: basics.getBaseUrl() + "/oga-login/",
    // constant value of
    token_type: "token_type",
    // constant value of
    access_token: "access_token",
    // constant value of
    expires_in: "expires_in",
    // constant value of
    refresh_token: "refresh_token",
    // constant value of
    auth_action: "auth_action",
    // constant value of
    code: "code",
    // constant value of
    bearer = "bearer",
    // constant value of
    expires_in_number: Number(2533343),
    logout: "LOG OUT",
    login: "LOG IN"
};

let queryString = {
    // value from queryString of
    token_type: () => basics.getQueryString(constants.token_type),
    // value from queryString of
    access_token: () => basics.getQueryString(constants.access_token),
    // value from queryString of
    expires_in: () => basics.getQueryString(constants.expires_in),
    // value from queryString of
    refresh_token: () => basics.getQueryString(constants.refresh_token),
    // value from queryString of
    auth_action: () => basics.getQueryString(constants.auth_action),
    // value from queryString of
    code: () => basics.GetQueryString(constants.code)
};

let basics = {
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
    // Generating ramson code
    S4: function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    // Generating GUID from random code
    Guid: function() {
        // then to call it, plus stitch in "4" in the third group
        let guid = (this.S4() + this.S4() + "-" + this.S4() + "-4" + this.S4().substr(0, 3) + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4()).toLowerCase();
        return guid;
    },
    LogText: (logged) => Boolean(logged) ? constants.logout : constants.login,
};

// Please acknowledge use of this code by including this header.
let cookie = {
    today: new Date(),
    // Cookie expiry period
    expiry: new Date(this.today.getTime() + 30 * 24 * 3600 * 1000), // plus 30 days
    // Cookie expired period from past
    expired: new Date(this.today.getTime() - 24 * 3600 * 1000), // less 24 hours
    //Setting up or adding cookies to browser with name and value
    set: function(name, value) {
        if (value != null && value.trim().length > 0) {
            // Encode the String
            let encodedString = value;
            document.cookie = name + "=" + escape(encodedString) + "; path=/; expires=" + this.expiry;
        }
    },
    //Getting or retrieving cookies from browser by name
    get: function(name) {
        let regex = new RegExp(name + "=([^;]+)");
        let encodedString = regex.exec(document.cookie);
        // Decode the String
        if (encodedString != null) {
            let value = encodedString[1];
            return (value != null) ? unescape(value) : null;
        }
        return "";
    },
    //Removing cookies by name
    remove: function(name) {
        document.cookie = name + "=null; path=/; expires=" + this.expired;
    }
};