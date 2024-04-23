document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Ouverture de l'URL dans InAppBrowser avec des options spécifiques
    const ref = cordova.InAppBrowser.open('https://snk.ps8.academy/', '_blank', 'location=no,toolbar=no,zoom=no');

    // Redéfinition de window.open pour toutes les ouvertures futures dans l'application
    window.open = cordova.InAppBrowser.open;

    // Affichage du splash screen
    navigator.splashscreen.show();
    window.setTimeout(function () {
        navigator.splashscreen.hide();
    }, 3000); // Le splash screen est affiché pendant 3 secondes

    console.log(navigator.connection.type); // Affiche le type de connexion réseau
}

// Ajout de l'écouteur pour l'événement deviceready au niveau global
document.addEventListener('deviceready', onDeviceReady, false);

//PLUGIN NETWORK INFORMATION

// Écouter pour les changements d'état de la connexion réseau
document.addEventListener('offline', onOffline, false);
document.addEventListener('online', onOnline, false);

function onOffline() {
    // L'application est maintenant hors ligne
}

function onOnline() {
    // L'application est maintenant en ligne
}
