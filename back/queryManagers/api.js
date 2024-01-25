const { getUsers, getUser, createUser } = require('../database/database.js')
const bcrypt = require('bcrypt')
const { sign } = require('../jwt/jwt.js')

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
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }))
        return
    }

    // Get the data from the request body
    getJsonBody(request).then((body) => {
        // Validate the object
        if (!body.email || !body.username || !body.password) {
            response.writeHead(400, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({ error: 'Données manquantes' }))
            return
        }

        getUser(body.email).then((user) => {
            if (user) {
                response.writeHead(409, { 'Content-Type': 'application/json' })
                response.end(
                    JSON.stringify({ error: 'Utilisateur déjà existant' })
                )
                return // Stop execution if user already exists
            }

            // Hash the password
            bcrypt.hash(body.password, 10, (err, hash) => {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'application/json',
                    })
                    response.end(
                        JSON.stringify({
                            error: 'Erreur lors de la création de l utilisateur',
                        })
                    )
                    return // Stop execution on hash error
                }

                body.password = hash

                createUser(body).then((newUser) => {
                    if (!newUser) {
                        response.writeHead(500, {
                            'Content-Type': 'application/json',
                        })
                        response.end(
                            JSON.stringify({
                                error: 'Erreur lors de la création de l utilisateur',
                            })
                        )
                        return // Stop execution on creation error
                    }

                    response.writeHead(200, {
                        'Content-Type': 'application/json',
                    })
                    response.end(
                        JSON.stringify({
                            message: 'Utilisateur enregistré avec succès',
                        })
                    )
                })
            })
        })
    })
}

function handleLogin(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }))
        return
    }

    // Get the data from the request body
    getJsonBody(request).then((body) => {
        // Validate the object
        if (!body.email || !body.password) {
            response.writeHead(400, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({ error: 'Données manquantes' }))
            return
        }

        getUser(body.email).then((user) => {
            if (!user) {
                response.writeHead(404, { 'Content-Type': 'application/json' })
                response.end(
                    JSON.stringify({ error: 'Utilisateur inexistant' })
                )
                return // Stop execution if user doesn't exist
            }

            // Compare the password with the hash
            bcrypt.compare(body.password, user.password, (err, result) => {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'application/json',
                    })
                    response.end(
                        JSON.stringify({ error: 'Erreur lors de la connexion' })
                    )
                    return // Stop execution on hash error
                }

                if (!result) {
                    response.writeHead(401, {
                        'Content-Type': 'application/json',
                    })
                    response.end(
                        JSON.stringify({ error: 'Mot de passe incorrect' })
                    )
                    return // Stop execution on wrong password
                }

                // Generate a JWT
                let token = sign({ email: user.email }, 'todo-secret-key')

                console.log(token)

                response.writeHead(200, { 'Content-Type': 'application/json' })
                response.end({ token: token })
            })
        })
    })
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

function getJsonBody(request) {
    return new Promise((resolve, reject) => {
        let body = ''
        request.on('data', (chunk) => {
            body += chunk.toString()
        })

        request.on('end', () => {
            resolve(JSON.parse(body))
        })
    })
}

exports.manage = manageRequest
