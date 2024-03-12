copyPasswordToClipboard();

document.getElementById('saveBtn').addEventListener('click', function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const secret = document.getElementById('secret').value;
    const urlPatterns = document.getElementById('urlPatterns').value.split('\n');

    chrome.storage.sync.set({
        username: username,
        password: password,
        secret: secret,
        urlPatterns: urlPatterns,
    }, function () {
        if (chrome.runtime.lastError) {
            console.error("Error saving settings:", chrome.runtime.lastError);
        } else {
            console.log("Settings saved successfully.");
            console.log("Saved values - Username:", username, "Password:", password, "Secret:", secret);
        }
    });

    showNotification("Configurations saved successfully.", "success");
});


document.addEventListener('DOMContentLoaded', function () {
    // Fetch configurations and populate the form fields
    chrome.storage.sync.get(['username', 'password', 'secret', 'urlPatterns'], function (data) {
        document.getElementById('username').value = data.username || '';
        document.getElementById('password').value = data.password || '';
        document.getElementById('secret').value = data.secret || '';
        document.getElementById('urlPatterns').value = (data.urlPatterns && data.urlPatterns.join('\n')) || '';
    });

    // 2. Show current configurations, mask sensitive data
    chrome.storage.sync.get(['username', 'urlPatterns'], function (data) {
        document.getElementById('username').textContent = data.username || 'Not set';
        document.getElementById('urlPatterns').textContent = (data.urlPatterns && data.urlPatterns.join(', ')) || 'Not set';
    });
});



function copyPasswordToClipboard() {
    chrome.storage.sync.get(['password', 'secret'], function (data) {
        if (data.password && data.secret) {
            const otp = generateOTP(data.secret);
            const combinedPassword = data.password + otp;
            copyToClipboard(combinedPassword);
            showNotification("Password + OTP copied to clipboard.", "success"); // Moved inside the callback
        } else {
            console.log("Cannot generate OTP and copy combined password");
            showNotification("Failed to copy. Check your configurations.", "error"); // Added error notification
        }
    });
}

//3. UI user has a button copy password (password+OTP)
document.getElementById('copyPasswordBtn').addEventListener('click', function () {
    copyPasswordToClipboard();
});

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}



// Generate OTP every 30 seconds
let currentSecret = ''; // We'll fetch and store the secret here.
const OTP_DURATION = 30; // in seconds
let otpCountdown = OTP_DURATION; // current countdown value

function updateOTPCountdown() {
    const progressBar = document.getElementById('otp-progress-bar');
    progressBar.value = otpCountdown;

    if (otpCountdown <= 0) {
        otpCountdown = OTP_DURATION; // Reset to 30s when reaching 0
    } else {
        otpCountdown--;
    }
}
// Update the OTP and countdown logic:
function updateOTP() {
    if (!currentSecret) return; // If there's no secret, don't try to generate an OTP.

    const otp = window.otplib.authenticator.generate(currentSecret);
    document.getElementById('current-otp').value = otp;
    otpCountdown = OTP_DURATION; // Reset countdown
    updateOTPCountdown();
}


// When the popup opens, fetch the current secret and start the OTP updates.
chrome.storage.sync.get('secret', function(data) {
    if (data.secret) {
        currentSecret = data.secret;
        updateOTP();

        // Update the OTP every 30 seconds.
        setInterval(updateOTP, 30000);

        // Update countdown every second.
        setInterval(updateOTPCountdown, 1000);
    } else {
        // Handle the case where there's no secret.
    }
});


const modal = document.getElementById('notificationModal');
const span = document.getElementsByClassName("close-btn")[0];
const modalMessage = document.getElementById('modalMessage');

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function showNotification(message, type) {
    modalMessage.textContent = message;
    modal.style.display = "block";
}


// detail option
const detailsElement = document.querySelector('details');

detailsElement.addEventListener('toggle', event => {
    if (detailsElement.open) {
        // The details have been expanded, perhaps save this state somewhere
    } else {
        // The details have been collapsed, perhaps save this state too
    }
});
