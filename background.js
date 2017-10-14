// set this cookie to make Reddit not show the mobile site on mobile devices
const noMobileCookie = {
    url: "https://.reddit.com",
    name: "mweb-no-redirect",
    value: "1",
    secure: true
};

function onError(error) {
    console.error(error);
}

function onSuccess(result) {
    console.log(result);
}

/**
 * Sets a cookie to prevent reddit.com from loading a mobile-friendly version
 * of its site on mobile devices.
 */
function setCookie() {
    const getCookieStores = browser.cookies.getAllCookieStores();
    getCookieStores.then((cookieStores) => {
        // set a cookie for each open cookie store (default, private, etc.)
        for (store of cookieStores) {
            noMobileCookie.storeId = store.id;
            const promise = browser.cookies.set(noMobileCookie);
            promise.then(onSuccess, onError);
        }
    }, onError);
}

(function () {
    // set the cookie on profile/extension load and for every new tab
    browser.runtime.onInstalled.addListener(setCookie);
    browser.runtime.onStartup.addListener(setCookie);
    browser.tabs.onCreated.addListener(setCookie);
})();