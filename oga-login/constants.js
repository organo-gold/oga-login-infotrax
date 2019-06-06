"use strict"

const constants = {
    // class name is used to access anchorTAG
    ATTAINABLE_CLASS: ["og-attainable-button"],
    // class name is used to access parent of anchorTAG
    ATTAINABLE_PARENT_CLASS: ["og-attainable-menu"],
    // "last accessed page" cookie name
    LAST_ACTIVE_PAGE: "__utap_B46DE3ED_F325",
    // constant value of
    HREF: "href",
    // constant value of
    TARGET: "target",
    // constant value of
    PARENT: "_parent",
    // constant value of
    TOP: "_top",
    // constant value of
    OGA_LOGIN_PAGE: helper.getBaseUrl() + "/o-auth/?callback=" + window.location.href /*oga-login*/ ,
    // constant value of
    LOGOUT: "LOG OUT",
    LOGIN: "LOG IN",
    API_KEY: "_xak__",
    DIST_ID: "_xdi__",
    // "token id" cookie name
    TOKEN: "__utat_239FE8A9AT_F3F4",
    HOME_PAGE: "https://ogacademystg.wpengine.com/",
    CALLBACK: "callback",
    BASE_API_URL: "https://api.oghq.ca", //"https://localhost:44324", //
    USER_AUTH_URL: "http://organogold-dts.myvoffice.com/organogold/index.cfm?service=Session.login&apikey=[ak]&DTSPASSWORD=[pw]&DTSUSERID=[ds]&format=json",
    DETAIL_BY_TOKEN_URL: "http://organogold-dts.myvoffice.com/organogold/index.cfm?jsessionid=[token]&service=Genealogy.distInfoBySavedQuery&apikey=[ak]&QRYID=DistConfData&DISTID=[di]&APPNAME=Admin&GROUP=Reports&format=JSON&fwreturnlog=1"
};