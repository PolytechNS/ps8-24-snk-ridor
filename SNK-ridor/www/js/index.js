document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    const ref = cordova.InAppBrowser.open('https://snk.ps8.academy/', '_blank', 'location=no,toolbar=no,zoom=no');
    window.open = cordova.InAppBrowser.open;
}
