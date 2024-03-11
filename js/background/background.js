chrome.runtime.onInstalled.addListener(function () {
    const currentTimestamp = new Date();
    const formattedTimestamp = `${currentTimestamp.getFullYear()}-${(currentTimestamp.getMonth() + 1).toString().padStart(2, '0')}-${currentTimestamp.getDate().toString().padStart(2, '0')} ${currentTimestamp.getHours().toString().padStart(2, '0')}:${currentTimestamp.getMinutes().toString().padStart(2, '0')}:${currentTimestamp.getSeconds().toString().padStart(2, '0')}`;
    console.log("AutoFill with OTP Extension installed at: " + formattedTimestamp);
});
