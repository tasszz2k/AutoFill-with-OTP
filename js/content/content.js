// console.log("AutoFill_with_OTP_Extension content script is running.");

const username_fields = ['username', 'login_username', 'user_login', 'user', 'login-form-username', 'os_username', 'Username'];
const password_fields = ['password', 'login_password', 'user_pass', 'login-form-password', 'os_password', 'Password', 'PIN + Google OTP'];

function triggerEvents(element) {
    ['input', 'change', 'keydown'].forEach(eventType => {
        const event = new Event(eventType, {'bubbles': true});
        element.dispatchEvent(event);
    });
}

function autoFillFields() {
    const usernameField = document.querySelector(getSelectorString(username_fields));
    const passwordField = document.querySelector(getSelectorString(password_fields));


    chrome.storage.sync.get(['username', 'password', 'secret'], function (data) {
        // console.log("Fetched values from storage -", data);

        if (usernameField && data.username && !usernameField.value) {
            usernameField.value = data.username;
            triggerEvents(usernameField);
            console.log("Filled username field with:", data.username);
        } else {
            console.log("Could not fill username field.");
        }

        if (passwordField && data.password && !passwordField.value) {
            const otp = generateOTP(data.secret);
            passwordField.value = data.password + otp;
            triggerEvents(passwordField);
            // log the mask password with OTP
            console.log("Filled password field with:", "******" + otp);
        } else {
            console.log("Could not fill password field.");
        }
    });
}

window.addEventListener('load', function () {
    // get current URL
    let currentURL = window.location.href;
    console.log("Current URL:", currentURL);
    shouldFillPassword(currentURL, function (shouldFill) {
        if (shouldFill) {
            console.log("Window loaded. Now attempting to autofill...");
            setTimeout(autoFillFields, 1000);
        } else {
            // console.log("This page does not require autofill.");
        }
    });
});


function generateOTP(secret) {
    // Your logic to generate OTP.
    let otp = window.otplib.authenticator.generate(secret);
    return otp;
}

// support both id, name, and placeholder attributes
function getSelectorString(selectors) {
    // format: input[name="username"], input[id="username"], input[placeholder="Username"], ...
    return selectors.map(selector => `input[name="${selector}"], input[id="${selector}"], input[placeholder="${selector}"]`).join(', ');
}

// read urlPatterns from storage
// compare the current url with the urlPatterns (check contains string)
function shouldFillPassword(url, callback) {
    chrome.storage.sync.get(['urlPatterns'], function (data) {
        let urlPatterns = data.urlPatterns;
        // check if urlPatterns is empty, return true
        if (!urlPatterns || urlPatterns.length === 0) {
            callback(true);
            return;
        }

        for (let i = 0; i < urlPatterns.length; i++) {
            if (url.includes(urlPatterns[i])) {
                console.log("URL matched with pattern", urlPatterns[i]);
                callback(true);
                return;
            }
        }
        callback(false);
    });
}