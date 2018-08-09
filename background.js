"use strict";

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
    browser.cookies.getAllCookieStores()
        .then((cookieStores) => {
            return Promise.all(cookieStores.map((store) => {
                // set a cookie per open cookie store (default, private, etc.)
                noMobileCookie.storeId = store.id;
                return browser.cookies.set(noMobileCookie);
            }));
        }).then((cookies) => { console.log(cookies); })
        .catch(onError);
}

function toggleRedirect(doRedirect) {
    if (doRedirect) {
        browser.webRequest.onBeforeRequest.addListener(
            redirect,
            {
                urls: [
                    'https://www.reddit.com/*',
                    'https://reddit.com/*',
                    'http://www.reddit.com/*',
                    'http://reddit.com/*'
                ]
            },
            [ 'blocking' ]);

        // flush in-memory cache to prevent fetchs from cache w/o redirect
        browser.webRequest.handlerBehaviorChanged()
            .then(() => { console.log('In-memory cache flush'); })
            .catch(onError);
    } else {
        const requestedPermissions = {
            permissions: [ 'webRequest', 'webRequestBlocking' ]
        };
        browser.permissions.contains(requestedPermissions)
            .then((result) => {
                if (result) {
                    if (browser.webRequest.onBeforeRequest.hasListener(redirect)) {
                        browser.webRequest.onBeforeRequest.removeListener(redirect);
                    }
                    // revoke webRequest permissions
                    browser.permissions.remove(requestedPermissions)
                        .then((result) => {
                            result
                                ? console.log('Permissions revoked')
                                : console.error('Permissions revoke error');
                        });
                }}).catch(onError);
    }
}

/**
 * Listener to redirect www.reddit.com requests to old.reddit.com
 */
function redirect(request) {
    console.log(request.url);
    const redirectUrl = request.url.replace(
        /^(?:https|http):\/\/(?:www\.)?reddit\.com/,
        'https://old.reddit.com');
    return Promise.resolve({ redirectUrl });
}

(function () {
    // set the cookie on profile/extension load and for every new tab
    browser.runtime.onInstalled.addListener(setCookie);
    browser.runtime.onStartup.addListener(setCookie);
    browser.tabs.onCreated.addListener(setCookie);

    // check if redirecting is enabled, default to false
    browser.storage.local.get({ redirect: false })
        .then((obj) => { toggleRedirect(obj.redirect); })
        .catch(onError);

    // enable/disable redirect on storage change
    browser.storage.onChanged.addListener((changes) => {
        if ('redirect' in changes) {
            if (changes.redirect.oldValue !== changes.redirect.newValue) {
                toggleRedirect(changes.redirect.newValue);
            }
        }
    });

    // open preference page onInstall, once
    browser.runtime.onInstalled.addListener(() => {
        browser.storage.local.get({ firstInstall: true })
            .then((obj) => {
                if (obj.firstInstall) return browser.runtime.openOptionsPage();
            }).then(() => {
                return browser.storage.local.set({ firstInstall: false });
            }).then(() => { return browser.storage.local.get(); })
            .then((obj) => { console.log(obj); })
            .catch(onError);
    });
})();
