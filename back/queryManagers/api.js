// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
function manageRequest(request, response) {
    // Ici, nous extrayons la partie de l'URL qui indique l'endpoint
    let endpoint = request.url.split('/')[2] // Supposant que l'URL est sous la forme /api/endpoint

    switch (endpoint) {
        case 'signup':
            handleSignup(request, response)
            break
        case 'login':
            handleLogin(request, response)
            break
        case 'game':
            handleGame(request, response)
            break
        case 'rank':
            handleRank(request, response)
            break
        case 'profile':
            handleProfile(request, response)
            break
        case 'chat':
            handleChat(request, response)
            break
        case 'friends':
            handleFriends(request, response)
            break
        case 'check-action':
            handleCheckAction(request, response)
            break
        default:
            response.writeHead(404, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({ error: 'Endpoint non trouvé' }))
    }
}

function handleSignup(request, response) {
    if (request.method === 'POST') {
        // Ici, recueillez les données POST (email, nom d'utilisateur, mot de passe)
        // Validez et enregistrez les données dans la base de données
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(
            JSON.stringify({ message: 'Utilisateur enregistré avec succès' })
        )
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }))
    }
}

function handleLogin(request, response) {
    if (request.method === 'POST') {
        // Collectez et validez les données de connexion
        // Si valide, générez un JWT
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ token: 'jwt-token-ici' }))
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }))
    }
}

function handleGame(request, response) {
    if (request.method === 'POST') {
        // Créer une nouvelle session de jeu
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(
            JSON.stringify({ message: 'Nouvelle session de jeu créée' })
        )
    } else if (request.method === 'GET') {
        // Récupérer l'état d'un jeu existant
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ gameData: 'données du jeu ici' }))
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }))
    }
}

function handleRank(request, response) {
    if (request.method === 'GET') {
        // Logique pour récupérer le classement des joueurs
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ rankData: 'données du classement ici' }))
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }))
    }
}

function handleProfile(request, response) {
    if (request.method === 'GET') {
        // Logique pour récupérer le profil de l'utilisateur
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ userProfile: 'données du profil ici' }))
    } else if (request.method === 'PUT') {
        // Logique pour mettre à jour le profil de l'utilisateur
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'Profil mis à jour' }))
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }))
    }
}

function handleChat(request, response) {
    if (request.method === 'POST') {
        // Logique pour envoyer un message de chat
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'Message envoyé' }))
    } else if (request.method === 'GET') {
        // Logique pour récupérer l'historique des messages
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(
            JSON.stringify({ chatHistory: 'historique des chats ici' })
        )
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }))
    }
}

function handleFriends(request, response) {
    if (request.method === 'GET') {
        // Logique pour récupérer la liste d'amis
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ friendsList: 'liste d amis ici' }))
    } else if (request.method === 'POST') {
        // Logique pour ajouter un ami
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'Ami ajouté' }))
    } else if (request.method === 'DELETE') {
        // Logique pour supprimer un ami
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'Ami supprimé' }))
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }))
    }
}

function handleCheckAction(request, response) {
    if (request.method === 'GET') {
        // Logique pour vérifier une action
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ actionStatus: 'statut de l action ici' }))
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }))
    }
}

/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
 ** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
 ** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
 ** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
 ** are probably not the ones you will need. */
function addCors(response) {
    // Website you wish to allow to connect to your server.
    response.setHeader('Access-Control-Allow-Origin', '*')
    // Request methods you wish to allow.
    response.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    )
    // Request headers you wish to allow.
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With,content-type'
    )
    // Set to true if you need the website to include cookies in the requests sent to the API.
    response.setHeader('Access-Control-Allow-Credentials', true)
}

exports.manage = manageRequest
