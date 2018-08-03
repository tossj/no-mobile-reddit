"use strict";

function saveOptions(ev) {
    const cb = ev.target;

    // disable checkbox before storage
    toggleForm(true, cb.form);

    // save storage
    const obj = {};
    obj[cb.name] = cb.checked;
    const cbPromise = browser.storage.local.set(obj)
        .then(onSuccess, onError);

    // enable checkbox
    setTimeout(() => { toggleForm(false, cb.form); }, 700);
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
    // checkbox event listener
    const redirectCb = document.getElementById('redirect-reddit');
    redirectCb.addEventListener('change', saveOptions);
}());
