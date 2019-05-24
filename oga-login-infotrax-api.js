/********Oauth - Distributor Authentication Script  using Abovegem page  *********/
(function() {
    // Localize jQuery variable
    var jQuery;
    /******** Load jQuery if not present *********/
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== '3.0.0') {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js");
        if (script_tag.readyState) {
            script_tag.onreadystatechange = function() { // For old versions of IE
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
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

    function displayContentMessage(text) {
        //console.log(text + '::');
    }
    /******** Content Setup function ********/
    function content_setup() {
        displayContentMessage('content_setup');
        //initialize with document ready function
        jQuery(document).ready(function($) {
            displayContentMessage('ready');
            // class name is used to access anchorTAG
            var attainableCls = ['og-attainable-button'];
            // class name is used to access parent of anchorTAG
            var attainableParentCls = ['og-attainable-menu'];
            //Cookie name initialization
            var _token_type_text = "__utmt_E520AB15MT_E999";
            var _access_token_text = "__utat_239FE8A9AT_F3F4";
            var _expires_in_text = "__utei_95732C2AEI_ADDC";
            var _refresh_token_text = "__utrt_107D4822RT_A28D";
            var _access_page = "__utap_B46DE3ED_F325";
            var redirect_url = 'http://qa.oghq.ca/SSOCallback/';
            var auth_token = null;

            // JavaScript code to GET and SET cookies :: START
            // Please acknowledge use of this code by including this header.
            var today = new Date();
            var expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000); // plus 30 days
            var expired = new Date(today.getTime() - 24 * 3600 * 1000); // less 24 hours

            //Setting up or adding cookies to browser with name and value
            function cookieSet(name, value) {
                if (value != null && value.trim().length > 0) {
                    // Encode the String
                    var encodedString = value;
                    document.cookie = name + "=" + escape(encodedString) + "; path=/; expires=" + expiry;
                }
            }

            //Getting or retrieving cookies from browser by name
            function cookieGet(name) {
                var re = new RegExp(name + "=([^;]+)");
                var encodedString = re.exec(document.cookie);
                // Decode the String
                if (encodedString != null) {
                    var value = encodedString[1];
                    return (value != null) ? unescape(value) : null;
                }
                return "";
            }

            //Removing cookies by name
            function cookieRemove(name) {
                document.cookie = name + "=null; path=/; expires=" + expired;
            }
            // JavaScript code to GET and SET cookies :: END
            displayContentMessage('before page_Load');
            // calling code on load to check user code got token or not
            pageLoad();

            // obtaining user action and checking (is user valid?)
            $('a').click(function(event) {
                //getting current clicked anchor
                var $elem = $(this);
                var controlVerified = verifyControl($elem);
                // if class exists
                if (controlVerified === true) {
                    //preventing default action on specific anchor tab click
                    event.preventDefault();
                    checkUserValidation(0, $(this).attr("href"), (typeof $(this).attr("target") == 'undefined' || $(this).attr("target") == null) ? '_parent' : $(this).attr("target"));
                }
            });

            function verifyControl($elem) {
                var controlVerified = false;
                // comparing with current element classes
                if (typeof attainableCls !== 'undefined' && attainableCls !== null && attainableCls.length > 0) {
                    $.each(attainableCls, function(index, attainableCl) {
                        // checking 'attainableCls' variable contain dot (.) with class.
                        //if yes, then remove it
                        if (attainableCl.charAt(0) === '.') {
                            attainableCl = attainableCl.substr(1);
                        }
                        // comparing if current element have specified class
                        if ($elem.hasClass(attainableCl) === true) {
                            controlVerified = true;
                        }
                    });
                }
                // comparing with parent classes
                if (controlVerified === false && typeof attainableParentCls !== 'undefined' && attainableParentCls !== null && attainableParentCls.length > 0) {
                    $.each(attainableParentCls, function(index, attainableParent) {
                        // checking 'attainableCls' variable contain dot (.) with class.
                        //if yes, then remove it
                        if (attainableParent.charAt(0) === '.') {
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
                    auth_token = cookieGet(_access_token_text);
                }
                //saving clicked url in cookie and sending request to validate user
                var initial_url = pageUrl;
                if (typeof auth_token === 'undefined' || auth_token === null || auth_token.trim().length === 0) {
                    cookieSet(_access_page, initial_url);
                    var baseUrl = getBaseUrl();
                    window.open(baseUrl + '/oga-login/', '_parent');
                } else if (isPage === 1) {
                    // To prevent displaying page then removing later ####################### (3 of 4)
                    //$('body').removeClass('hidden');
                } else {
                    //if user is already validated then go directly to action page
                    window.open(initial_url, _target);
                }
                updateUserStatus();
            }

            // function to check user got token or not
            function pageLoad() {
                displayContentMessage('page_Load');
                var auth_action_string = GetQueryString("auth_action");
                displayContentMessage('auth_action_string::');
                displayContentMessage(auth_action_string);
                var auth_code = GetQueryString("code");
                displayContentMessage('auth_code::');
                displayContentMessage(auth_code);
                // Comparing user auth token
                if (typeof auth_action_string !== 'undefined' && auth_action_string !== null && parseInt(auth_action_string) === 0) {
                    displayContentMessage('auth_action_string::inside');
                    addUserToken(updateUserToken);
                }
                //comparing user login code
                else if (typeof auth_code !== 'undefined' && auth_code !== null && auth_code.length > 0) {
                    displayContentMessage('auth_code::inside');
                    /********************* TEMP CODE ::STARTS *****************/
                    temporaryAuth(updateUserToken);
                    /********************* TEMP CODE::ENDS ********************/

                    /*************** LIVE CODE ::STARTS ****************/
                    //finalAuth();
                    /***************** LIVE CODE ::ENDS ****************/
                } else {
                    // getting current page url and comparing with anchor tag that contains same class
                    var href = window.location.href;
                    // The first argument is the index, the second is the element
                    $('a').each(function(index, element) {
                        if ($(element).attr("href") == href) {
                            if (verifyControl($(element)) === true) {
                                checkUserValidation(1, href, (typeof $(element).attr("target") == 'undefined' || $(element).attr("target") == null) ? '_parent' : $(element).attr("target"));
                                return;
                            }
                        }
                    });
                }
                updateUserStatus();
            }

            function temporaryAuth(callback) {
                displayContentMessage('temporaryAuth::before');
                /*************** TEMP CODE :: STARTS ***************/
                function S4() {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                }

                function Guid() {
                    // then to call it, plus stitch in '4' in the third group
                    var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
                    return guid;
                }
                var newGuid = Guid();
                var token_type = "bearer";
                var access_token = newGuid;
                var expires_in = 2533343;
                newGuid = Guid();
                var refresh_token = newGuid;
                displayContentMessage('temporaryAuth::after');
                callback(token_type, access_token, expires_in, refresh_token);
                /*************** TEMP CODE :: ENDS ***************/
            }

            function addUserToken(callback) {
                //Getting data from Query String
                var token_type = GetQueryString("token_type");
                var access_token = GetQueryString("access_token");
                var expires_in = GetQueryString("expires_in");
                var refresh_token = GetQueryString("refresh_token");
                callback(token_type, access_token, expires_in, refresh_token);
            }

            function updateUserToken(token_type, access_token, expires_in, refresh_token) {
                displayContentMessage('updateUserToken::before');
                //Checking and removing existing cookies
                if (cookieGet(_token_type_text) !== null) {
                    cookieRemove(_token_type_text);
                }
                if (cookieGet(_access_token_text) !== null) {
                    cookieRemove(_access_token_text);
                }
                if (cookieGet(_expires_in_text) !== null) {
                    cookieRemove(_expires_in_text);
                }
                if (cookieGet(_refresh_token_text) !== null) {
                    cookieRemove(_refresh_token_text);
                }
                //Setting up or adding new cookie
                cookieSet(_token_type_text, token_type);
                cookieSet(_access_token_text, access_token);
                //cookieSet(_expires_in_text, expires_in);
                cookieSet(_refresh_token_text, refresh_token);
                displayContentMessage('updateUserToken::getToken::before');
                auth_token = cookieGet(_access_token_text);
                displayContentMessage('updateUserToken::getToken::after');
                displayContentMessage(auth_token);
                //Removing Query string from url if any
                RemoveQueryString();
                //Getting page cookie from where user came before redirecting to login page
                displayContentMessage('updateUserToken::getAccess::before');
                var accessPage = cookieGet(_access_page);
                displayContentMessage('updateUserToken::getAccess::after');
                displayContentMessage(accessPage);
                if (accessPage !== null && accessPage.trim().length !== 0) {
                    //removing page cookie
                    cookieRemove(_access_page);
                    //redirecting to corresponding link
                    var __target = '_parent';
                    displayContentMessage('updateUserToken::redirect::before');
                    window.open(accessPage, __target);
                }
                displayContentMessage('updateUserToken::after');
            }

            function finalAuth() {
                /*************** ACTUAL LIVE CODE :: STARTS ***************/

                //console.log('AJAX');
                //var og_client_id = "", og_client_secret = "", og_url = "", og_grant_type = "";
                //var setting_url = "http://qa.oghq.ca/ssocallback/og_settings.json";
                //$.ajax({
                //    url: setting_url,
                //    dataType: 'json'
                //}).done(function (r)
                //{
                //    if (r !== null) {
                //        og_client_id = r.client_id, og_client_secret = r.client_secret, og_url = r.url, og_grant_type = r.grant_type;
                //        post(og_url, { grant_type: og_grant_type, client_id: og_client_id, client_secret: og_client_secret, code: auth_code });
                //        function post(path, params, method)
                //        {
                //            //console.log("Post::Form");
                //            method = method || "POST"; // Set method to post by default if not specified.
                //            // The rest of this code assumes you are not using a library.
                //            // It can be made less wordy if you use one.
                //            var form = document.createElement("form");
                //            form.setAttribute("method", method);
                //            form.setAttribute("action", path);
                //            form.setAttribute("Content-Type", "application/x-www-form-urlencoded");
                //            for (var key in params) {
                //                if (params.hasOwnProperty(key)) {
                //                    var hiddenField = document.createElement("input");
                //                    hiddenField.setAttribute("type", "hidden");
                //                    hiddenField.setAttribute("name", key);
                //                    hiddenField.setAttribute("value", params[key]);
                //                    form.appendChild(hiddenField);
                //                }
                //            }
                //            document.body.appendChild(form);
                //            //    form.submit(function ()
                //            //    {
                //            //        console.log("FORM::SUBMIT");
                //            //        $.post($(this).attr('action'), $(this).serialize(), function (json)
                //            //        {
                //            //            //alert(json);
                //            //            var response = JSON.parse(json);
                //            //            //console.log("SUCCESS::IN");
                //            //            //console.log("The server response::");
                //            //            console.log(response);
                //            //            if (parseInt(response.status) === 200) {
                //            //                //console.log("200::" + response.status);
                //            //                var token_type = response.token_type;
                //            //                var access_token = response.access_token;
                //            //                var expires_in = response.expires_in;
                //            //                var refresh_token = response.refresh_token;
                //            //                window.open("http://r2.ogmentorship.com/" + "?auth_action=0&token_type=" + token_type + "&access_token=" + access_token + "&expires_in=" + expires_in + "&refresh_token=" + refresh_token, '_parent');
                //            //            }
                //            //            else if (parseInt(response.status) === 400) {
                //            //                console.log("400::" + response.status);
                //            //            }
                //            //            else {
                //            //                console.log(response.status);
                //            //            }
                //            //        }, 'json');
                //            //        return false;
                //            //    });
                //        }
                //    }
                //}).fail(function (msg)
                //{
                //    console.log('fail', msg);
                //});

                /*************** ACTUAL LIVE CODE :: ENDS ***************/
            }

            //Getting query string value by key name
            function GetQueryString(name) {
                var vars = [],
                    hash;
                var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
                for (var i = 0; i < hashes.length; i++) {
                    hash = hashes[i].split('=');
                    vars.push(hash[0]);
                    vars[hash[0]] = hash[1];
                }
                return vars[name];
            }

            //Removing query string from url
            function RemoveQueryString() {
                history.pushState(null, "", location.href.split("?")[0]);
            }

            function getBaseUrl() {
                var pathArray = location.href.split('/');
                var protocol = pathArray[0];
                var host = pathArray[2];
                var url = protocol + '//' + host;
                return url;
            }

            function updateUserStatus() {
                var logged = false;
                //Get and check user cookies exist or not
                auth_token = cookieGet(_access_token_text);
                if (typeof auth_token != 'undefined' && auth_token != null && auth_token.trim().length > 0) {
                    logged = true;
                }

                // Remove li.list-current-status if already exists
                $('ul.social-menu').find('li.list-current-status').remove();

                // Add li.list-current-status with user status
                var listTag = document.createElement('li');
                listTag.setAttribute('class', 'menu-item menu-item-type-custom menu-item-object-custom list-current-status');

                // Add Login and Logout button to take desired action
                var actionButton = document.createElement('a');
                actionButton.setAttribute('class', 'og-user-status');
                actionButton.setAttribute('href', '');
                // If user is log
                actionButton.innerText = logged == true ? 'LOG OUT' : 'LOG IN';
                listTag.appendChild(actionButton);
                $('header').find('ul#menu-top-header').append(listTag);
                $('header').find('ul#menu-top-header-spanishus').append(listTag);
                $('header').find('ul#menu-top-header-chinese-us').append(listTag);
                $('header').find('ul#menu-top-header-english-canada').append(listTag);
                $('header').find('ul#menu-top-header-french-canada').append(listTag);
                $('header').find('ul#menu-top-header-chinese-canada').append(listTag);
                $('header').find('ul#menu-top-header-italian').append(listTag);
                $('header').find('ul#menu-top-header-germany-german').append(listTag);
                $('header').find('ul#menu-top-header-thai-thailand').append(listTag);
                $('header').find('ul#menu-top-header-hk').append(listTag);

                $('a.og-user-status').on('click', function(event) {
                    event.preventDefault();
                    var auth_token = cookieGet(_access_token_text);
                    if (typeof auth_token === 'undefined' || auth_token === null || auth_token.trim().length === 0) {
                        checkUserValidation(0, window.location.href, '_parent');
                    } else {
                        //Checking and removing existing cookies
                        if (cookieGet(_token_type_text) !== null) {
                            cookieRemove(_token_type_text);
                        }
                        if (cookieGet(_access_token_text) !== null) {
                            cookieRemove(_access_token_text);
                        }
                        if (cookieGet(_expires_in_text) !== null) {
                            cookieRemove(_expires_in_text);
                        }
                        if (cookieGet(_refresh_token_text) !== null) {
                            cookieRemove(_refresh_token_text);
                        }
                        window.open(getBaseUrl(), '_top');
                        return;
                    }
                });
            }
        });
    }
})();

/********Oauth - Distributor Authentication Script  using Abovegem page  *********/