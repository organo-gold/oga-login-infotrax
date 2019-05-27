$(function() {

    $('body').find('button[type=button]').click(function() {
        authenticate();
    });

    function authenticate() {
        showLoader();
        var ds = $("input[name=idistributor]").val();
        var pw = $("input[name=ipassword]").val();
        var url = "http://dev-organogold-dts.myvoffice.com/organogoldtst/index.cfm?service=Session.login&apikey=O3962162&DTSPASSWORD=" + pw + "&DTSUSERID=" + ds + "&format=json";
        url = "http://organogold-dts.myvoffice.com/organogold/index.cfm?service=Session.login&apikey=O3962162&DTSPASSWORD=" + pw + "&DTSUSERID=" + ds + "&format=json";
        console.log("auth_url: ", url);
        if (validate()) {
            jQuery.support.cors = true;
            $.ajax({
                url: url,
                type: "GET",
                dataType: "text",
                "Content-Type": "application/json",
                success: function(data, res, req) {
                    console.log("data: ", data);
                    console.log("response: ", res);
                    console.log("request: ", req);

                    var result = { "SESSION": "aaba56ac-de0c-46b8-8dbc-02ea55f0218c", "LOAD": 1, "ROLES": "distributor" };
                    // { "MESSAGE": "Login Error", "DETAIL": "Invalid user", "TIMESTAMP": "05/27/2019 15:18:56", "ERRORCODE": "902" };
                    var stringified = JSON.stringify(result);
                    var parsedObj = JSON.parse(stringified);
                    if (parsedObj.SESSION !== undefined) {
                        getUserDetail(parsedObj.SESSION);
                    } else {
                        if (parsedObj.MESSAGE !== undefined) {
                            showMessage(parsedObj.DETAIL);
                        } else {
                            showMessage("Invalid User Info");
                        }
                        return;
                    }
                    hideLoader();
                },
                error: function(x, y, z) {
                    console.log("Error: ", x, y, z);
                    if (x.status === 401) {
                        //
                        $('.div-message').text("You are unauthorized");
                        return;
                    }
                    $('.div-message').text("Something went wrong. Unable to fetch data.");
                    hideLoader();
                }
            });
        }
    }

    function getUserDetail(token) {
        console.log("token: ", token);

        var url = "http://organogold-dts.myvoffice.com/organogold/index.cfm?jsessionid=" + token + "&service=Genealogy.distInfoBySavedQuery&apikey=O3962162&QRYID=DistConfData&DISTID=1000101&APPNAME=Admin&GROUP=Reports&format=JSON&fwreturnlog=1";
        jQuery.support.cors = true;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "text",
            "Content-Type": "application/json",
            success: function(data, res, req) {
                console.log("data: ", data);
                console.log("response: ", res);
                console.log("request: ", req);

                var result = { "ROWCOUNT": 1, "COLUMNS": ["NAME", "CITY", "STATE", "CELL_PHONE", "HOME_PHONE", "NAME2", "EMAIL", "STATUS", "END_RANK", "COU"], "DATA": { "NAME": ["ENTERPRISES SRL, SHANE MORAND"], "CITY": ["Santa Ana"], "STATE": ["SJ"], "CELL_PHONE": ["18888453990"], "HOME_PHONE": ["18888453990"], "NAME2": [""], "EMAIL": ["info@shanemorand.com"], "STATUS": ["D"], "END_RANK": ["15"], "COU": ["CAN"] } };
                // {"MESSAGE":"Validation Error","DETAIL":"Not Authorized to run this service","TIMESTAMP":"05/27/2019 15:49:03","ERRORCODE":"904"}
                var stringified = JSON.stringify(result);
                var parsedObj = JSON.parse(stringified);
                if (parsedObj.COLUMNS !== undefined) {
                    // CONTINUE
                    console.log("VALIDATED");
                } else {
                    if (parsedObj.DETAIL !== undefined) {
                        showMessage(parsedObj.DETAIL);
                    } else {
                        showMessage("Invalid User Info");
                    }
                    return;
                }
                hideLoader();
            },
            error: function(x, y, z) {
                console.log("Error: ", x, y, z);
                if (x.status === 401) {
                    //
                    $('.div-message').text("You are unauthorized");
                    return;
                }
                $('.div-message').text("Something went wrong. Unable to fetch data.");
                hideLoader();
            }
        });
    }

    function showMessage(text) {
        if (text !== undefined && text !== null) {
            $("div.message").text(text);
            $("div.message").removeClass("hidden");
        } else {
            $("div.message").text("");
            $("div.message").addClass("hidden");
        }
    }

    function validate() {
        var isvalid = true;
        var un = $('input[name=idistributor]').val();
        var pw = $('input[name=ipassword]').val();
        if (un === null ||
            un === 'undefined' ||
            un.trim().length === 0) {
            isvalid = false;
            $('input[name=idistributor]').parent().parent('.form-group').addClass('has-error');
        }
        if (pw === null ||
            pw === 'undefined' ||
            pw.trim().length === 0) {
            isvalid = false;
            $('input[name=ipassword]').parent().parent('.form-group').addClass('has-error');
        }
        console.log("validate(): " + isvalid);
        return isvalid;
    }

    function showLoader() {
        $('body').find('button[type=button]').addClass('disabled');
        $('body').find('input[name=idistributor]').addClass('disabled');
        $('body').find('input[name=ipassword]').addClass('disabled');
        $('.loading-results').removeClass("hide");
    }

    function hideLoader() {
        $('body').find('button[type=button]').removeClass('disabled');
        $('body').find('input[name=idistributor]').removeClass('disabled');
        $('body').find('input[name=ipassword]').removeClass('disabled');
        $('.loading-results').addClass("hide");
    }
});