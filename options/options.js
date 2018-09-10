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

    // set cookie
    browser.storage.local.set(obj)
        .then(() => { return browser.storage.local.get(); })
        .then((obj) => { console.log(obj); })
        .catch(onError)
        .then(timedEnable, timedEnable); // ensure form is re-enabled
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

    // fill checkbox with value from storage, default to true
    browser.storage.local.get({ redirect: true })
        .then((obj) => { redirectCb.checked = obj.redirect; })
        .catch(onError);
}());
