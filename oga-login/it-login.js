"use strict"

$(function() {

    $('body').find('button[type=button]').click(function() {
        authForm.authenticate();
    });
    $('body').find('button[type=reset]').click(function() {
        authForm.formReset();
    });

    authForm.formSet();

});

let authForm = {

    auth_url: "http://organogold-dts.myvoffice.com/organogold/index.cfm?service=Session.login&apikey=[ak]&DTSPASSWORD=[pw]&DTSUSERID=[ds]&format=json",
    authenticate: function() {
        this.showLoader();
        let ak = cookie.DecodeString(cookie.getCookie(this._ak));
        let ds = $("input[name=idistributor]").val();
        let pw = $("input[name=ipassword]").val();
        let url = this.auth_url.replace("[ak]", ak).replace("[ds]", ds).replace("[pw]", pw);
        console.log("auth_url: ", url);
        if (this.validate()) {
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
                    // { "MESSAGE": "Login Error", "DETAIL": "Invalid user", "TIMESTAMP": "05/27/2019 15:18:56", "ERRORCODE": "902" };
                    let stringified = JSON.stringify(result);
                    let parsedObj = JSON.parse(stringified);
                    if (parsedObj.SESSION !== undefined && parsedObj.SESSION !== null) {
                        authForm.getUserDetail(parsedObj.SESSION, ak);
                    } else {
                        if (parsedObj.DETAIL !== undefined && parsedObj.DETAIL !== null) {
                            authForm.showMessage(parsedObj.DETAIL);
                        } else {
                            authForm.showMessage("Invalid User Info");
                        }
                        return;
                    }
                    authForm.hideLoader();
                },
                error: function(x, y, z) {
                    console.log("Error: ", x, y, z);
                    if (x.status === 401) {
                        //
                        $('.div-message').text("You are unauthorized");
                        return;
                    }
                    $('.div-message').text("Something went wrong. Unable to fetch data.");
                    authForm.hideLoader();
                }
            });
        }
    },

    user_url: "http://organogold-dts.myvoffice.com/organogold/index.cfm?jsessionid=[token]&service=Genealogy.distInfoBySavedQuery&apikey=[ak]&QRYID=DistConfData&DISTID=[di]&APPNAME=Admin&GROUP=Reports&format=JSON&fwreturnlog=1",
    getUserDetail: function(token, ak) {
        console.log("token: ", token);
        let di = cookie.DecodeString(cookie.getCookie(this._di));
        let url = this.user_url.replace("[ak]", ak).replace("[di]", di).replace("[token]", token);
        console.log("getUserDetail(): ", url);
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
                // {"MESSAGE":"Validation Error","DETAIL":"Not Authorized to run this service","TIMESTAMP":"05/27/2019 15:49:03","ERRORCODE":"904"}
                let stringified = JSON.stringify(result);
                let parsedObj = JSON.parse(stringified);
                console.log("parsedObj.COLUMNS: ", parsedObj.COLUMNS);
                if (parsedObj.COLUMNS !== undefined && parsedObj.COLUMNS !== null) {
                    cookie.setCookie(cookie.tokenHeader, token, cookie.addHours(cookie.today(), 12));
                    // CONTINUE
                    console.log("VALIDATED");
                } else {
                    if (parsedObj.DETAIL !== undefined && parsedObj.DETAIL !== null) {
                        authForm.showMessage(parsedObj.DETAIL);
                    } else {
                        authForm.showMessage("Invalid User Info");
                    }
                    return;
                }
                authForm.hideLoader();
            },
            error: function(x, y, z) {
                console.log("Error: ", x, y, z);
                if (x.status === 401) {
                    //
                    $('.div-message').text("You are unauthorized");
                    return;
                }
                $('.div-message').text("Something went wrong. Unable to fetch data.");
                authForm.hideLoader();
            }
        });
    },

    showMessage: function(text) {
        if (text !== undefined && text !== null && text.trim().length > 0) {
            $("div.message").html(text);
            $("div.message").removeClass("hidden");
            this.hideLoader();
        } else {
            $("div.message").html("");
            $("div.message").addClass("hidden");
        }
    },

    validate: function() {
        let msg = "";
        let isvalid = true;
        let un = $('input[name=idistributor]').val();
        let pw = $('input[name=ipassword]').val();
        if (un === null ||
            un === 'undefined' ||
            un.trim().length === 0) {
            isvalid = false;
            msg += "Distributor ID is required<br/>";
            $('input[name=idistributor]').parent().parent('.form-group').addClass('has-error');
        }
        if (pw === null ||
            pw === 'undefined' ||
            pw.trim().length === 0) {
            isvalid = false;
            msg += "Password is required<br/>";
            $('input[name=ipassword]').parent().parent('.form-group').addClass('has-error');
        }
        this.showMessage(msg);
        return isvalid;
    },

    formReset: function() {
        $('input[name=idistributor]').parent().parent('.form-group').removeClass('has-error');
        $('input[name=ipassword]').parent().parent('.form-group').removeClass('has-error');
        this.showMessage();
    },

    _ak: "_ak__",
    _di: "_di__",

    formSet: function() {
        cookie.setCookie(this._ak, cookie.EncodeString("O3962162"), cookie.addHours(cookie.today(), 12));
        cookie.setCookie(this._di, cookie.EncodeString("1000101"), cookie.addHours(cookie.today(), 12));
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
    }
};