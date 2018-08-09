"use strict";

function saveOptions(ev) {
    const cb = ev.target;

    // disable checkbox before storage
    toggleForm(true, cb.form);
    // function to enable form after 700 ms
    const timedEnable = () => {
        setTimeout(() => { toggleForm(false, cb.form); }, 700);
    };

    // save storage
    const obj = {};
    obj[cb.name] = cb.checked;

    // ask for webRequest permissions first, if setting to true
    const promise = obj[cb.name]
        ? requestOptionalPermissions()
        : Promise.resolve();
    promise.then(() => { return browser.storage.local.set(obj); })
        .then(() => { return browser.storage.local.get(); })
        .then((obj) => { console.log(obj); })
        .catch(onError)
        .then(timedEnable, timedEnable); // ensure form is re-enabled
}

/**
 * Requests the WebExtension permissions listed in the optional_permissions
 * field of manifest.json.
 */
function requestOptionalPermissions() {
    // webRequest and webRequestBlocking do not prompt the user when requested
    // seems to also bypass restriction of asking for permissions from embedded
    // options_ui page set forth in FF v55-61
    const requestedPermissions = {
        permissions: [ 'webRequest', 'webRequestBlocking' ]
    };
    return browser.permissions.request(requestedPermissions)
        .then((result) => {
            result
                ? console.log('Permissions granted')
                : console.error('Permissions denied');
        }).catch(onError);
}

function onError(error) {
    console.error(error);
}

function onSuccess(result) {
    browser.storage.local.get().then((obj) => { console.log(obj); }, onError);
}

function toggleForm(disabled, form) {
    form.className = disabled === true ? 'disabled' : '';
    for (let i = 0; i < form.elements.length; i++) {
        form.elements[i].disabled = disabled;
    }
}

(function () {
    // register checkbox event listener
    const redirectCb = document.getElementById('redirect-reddit');
    redirectCb.addEventListener('change', saveOptions);

    // fill checkbox with value from storage, default to false
    browser.storage.local.get({ redirect: false })
        .then((obj) => { redirectCb.checked = obj.redirect; })
        .catch(onError);
}());
