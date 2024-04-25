document.addEventListener('deviceready', onDeviceReady, false);

var offlineActionsCompleted = false;

function onDeviceReady() {
    // Ouverture de l'URL dans InAppBrowser avec des options spécifiques
    var ref = cordova.InAppBrowser.open('https://snk.ps8.academy/', '_blank', 'location=no,toolbar=no,zoom=no');

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

function onOffline() {
    if (!offlineActionsCompleted) {
        // Effectuer les actions spécifiques à hors ligne
        navigator.notification.beep(1); // Émet un bip une fois
        alert('Vous êtes maintenant hors ligne ! Veuillez vérifier votre connexion.');

        //Proposer d'activer le wifi ou la 4G
        confirmNetworkActivation(function (buttonIndex) {
            if (buttonIndex == 1) {
                // Appeler la fonction pour activer le Wi-Fi
                onConfirmWifi(buttonIndex);
            } else if (buttonIndex == 2) {
                // Appeler la fonction pour activer la 4G (données mobiles)
                onConfirmMobileData(buttonIndex);
            } else if (buttonIndex == 3) {
                // Appeler la fonction pour annuler l'activation du réseau
                onConfirmCancel(buttonIndex);
            }
        });

        // Marquer les actions comme effectuées
        offlineActionsCompleted = true;
    }
}

function onConfirmWifi(buttonIndex) {
    if (buttonIndex == 1) {
        // Activer le Wi-Fi
        cordova.plugins.diagnostic.switchToWifiSettings(
            function (success) {
                console.log('Activation du WiFi réussie');
                // Recharger l'application une fois que l'utilisateur est revenu de l'écran des paramètres Wi-Fi
                checkConnectionAndReload();
            },
            function (error) {
                console.error("Erreur lors de l'activation du WiFi : " + error);
            }
        );
    }
}

function onConfirmMobileData(buttonIndex) {
    if (buttonIndex == 2) {
        // Activer la 4G (données mobiles)
        cordova.plugins.diagnostic.switchToMobileDataSettings(
            function (success) {
                console.log('Activation des données mobiles réussie');
                // Recharger l'application une fois que l'utilisateur est revenu de l'écran des paramètres de données mobiles
                checkConnectionAndReload();
            },
            function (error) {
                console.error("Erreur lors de l'activation des données mobiles : " + error);
            }
        );
    }
}

function onConfirmCancel(buttonIndex) {
    if (buttonIndex == 3) {
        // L'utilisateur a annulé l'activation du réseau
        alert('Vous êtes toujours hors ligne.');
        location.reload();
    }
}

function confirmNetworkActivation(callback) {
    navigator.notification.confirm(
        'Voulez-vous activer le Wi-Fi ou les données mobiles (4G) ?', // Message
        function (buttonIndex) {
            if (buttonIndex == 1 || buttonIndex == 2 || buttonIndex == 3) {
                callback(buttonIndex); // Passer l'index du bouton sélectionné à la fonction de rappel
            }
        },
        'Activer le réseau', // Titre
        ['Wi-Fi', '4G', 'Annuler'] // Boutons
    );
}

function onOnline() {
    //alert('Vous êtes maintenant en ligne!');
}

function checkConnection() {
    var networkState = navigator.connection.type;

    if (networkState === Connection.NONE || networkState === Connection) {
        onOffline(); // Appeler la fonction onOffline si l'appareil est hors ligne
        checkConnection(); // Vérifier à nouveau la connexion
    } else {
        onOnline(); // Appeler la fonction onOnline si l'appareil est en ligne
    }
}

function checkConnectionAndReload() {
    checkConnection(function (online) {
        if (online) {
            // Si la connexion est disponible, recharger l'application
            location.reload();
        }
    });
}
