document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Ouverture de l'URL dans InAppBrowser avec des options spécifiques
    const ref = cordova.InAppBrowser.open('https://snk.ps8.academy/', '_blank', 'location=no,toolbar=no,zoom=no');

    // Redéfinition de window.open pour toutes les ouvertures futures dans l'application
    window.open = cordova.InAppBrowser.open;

    //SPLASH SCREEN
    navigator.splashscreen.show();
    window.setTimeout(function () {
        navigator.splashscreen.hide();
    }, 3000); // Le splash screen est affiché pendant 3 secondes

    //NETWORK INFORMATION
    console.log(navigator.connection.type); // Affiche le type de connexion réseau

    // Écouter pour les changements d'état de la connexion réseau
    document.addEventListener('offline', onOffline, false);
    document.addEventListener('online', onOnline, false);

    // Vérifiez immédiatement l'état actuel de la connexion et prenez une action
    checkConnection();

    //NOTIFICATIONS
    var push = PushNotification.init({
        android: {},
        ios: {
            alert: 'true',
            badge: 'true',
            sound: 'true',
        },
    });

    push.on('registration', function (data) {});

    push.on('notification', function (data) {
        alert(data.message);
    });

    push.on('error', function (e) {
        console.error(e.message);
    });
}

// Ajout de l'écouteur pour l'événement deviceready au niveau global
document.addEventListener('deviceready', onDeviceReady, false);

function onOffline() {
    alert('Vous êtes maintenant hors ligne!');
}

function onOnline() {
    //alert('Vous êtes maintenant en ligne!');
}

function checkConnection() {
    var networkState = navigator.connection.type;

    if (networkState === Connection.NONE) {
        onOffline(); // Appeler la fonction onOffline si l'appareil est hors ligne
    } else {
        onOnline(); // Appeler la fonction onOnline si l'appareil est en ligne
    }
}
