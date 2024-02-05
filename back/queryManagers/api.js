const {
    getUser,
    createUser,
    getGame,
    createGame,
} = require('../database/database');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let default_secret =
    'Zo2yU9#sB9ZBtruAip*^XAEW4ectaXvfokK^D8sSdVwahBf*JuuJ2Jr$!jd!zE6eikA';
let secret = process.env.JWT_SECRET || default_secret;

if (secret === default_secret) {
    console.warn(
        'Warning: JWT_SECRET is not set, using default secret. This is not secure!'
    );
}

// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
function manageRequest(request, response) {
    // Ici, nous extrayons la partie de l'URL qui indique l'endpoint
    let url = new URL(
        request.url,
        `https://0.0.0.0:${process.env.PORT || 8000}`
    );
    let endpoint = url.pathname.split('/')[2]; // Supposant que l'URL est sous la forme /api/endpoint

    switch (endpoint) {
        case 'signup':
            handleSignup(request, response);
            break;
        case 'login':
            handleLogin(request, response);
            break;
        case 'game':
            handleGame(request, response);
            break;
        case 'rank':
            handleRank(request, response);
            break;
        case 'profile':
            handleProfile(request, response);
            break;
        case 'chat':
            handleChat(request, response);
            break;
        case 'friends':
            handleFriends(request, response);
            break;
        case 'check-action':
            handleCheckAction(request, response);
            break;
        default:
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Endpoint non trouvé' }));
    }
}

function handleSignup(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
        return;
    }

    // Get the data from the request body
    getJsonBody(request).then((body) => {
        // Validate the object
        if (!body.email || !body.username || !body.password) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Données manquantes' }));
            return;
        }

        createOrUpdateUser(
            body.email,
            body.username,
            body.password,
            response,
            true
        );
    });
}

function handleLogin(request, response) {
    if (request.method !== 'POST') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
        return;
    }

    // Get the data from the request body
    getJsonBody(request).then((body) => {
        // Validate the object
        if (!body.email || !body.password) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Données manquantes' }));
            return;
        }

        getUser(body.email).then((user) => {
            if (!user) {
                response.writeHead(404, { 'Content-Type': 'application/json' });
                response.end(
                    JSON.stringify({ error: 'Utilisateur inexistant' })
                );
                return; // Stop execution if user doesn't exist
            }

            // Hash the password
            body.password = crypto
                .createHash('sha512')
                .update(body.password)
                .digest('hex');

            if (user.password !== body.password) {
                response.writeHead(401, { 'Content-Type': 'application/json' });
                response.end(
                    JSON.stringify({ error: 'Mot de passe incorrect' })
                );
                return; // Stop execution on wrong password
            }

            // Generate a JWT
            let token = jwt.sign({ email: user.email }, secret);

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ token: token }));
        });
    });
}

function handleGame(request, response) {
    if (request.method !== 'POST' && request.method !== 'GET') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
        return;
    }

    let email = requireLogin(request, response);

    if (!email) {
        return;
    }

    let url = new URL(request.url, 'https://0.0.0.0:8000');

    if (request.method === 'POST') {
        // Generate a game id
        let sessionId = crypto.randomBytes(16).toString('hex');

        getJsonBody(request).then((body) => {
            createGame({
                _id: sessionId,
                player: email,
                data: body,
            }).then((newGame) => {
                if (!newGame) {
                    response.writeHead(500, {
                        'Content-Type': 'application/json',
                    });
                    response.end(
                        JSON.stringify({
                            error: 'Erreur lors de la création de la partie',
                        })
                    );
                    return; // Stop execution on creation error
                }

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(
                    JSON.stringify({
                        message: 'Partie créée avec succès',
                        gameId: sessionId,
                    })
                );
            });
        });
    }

    if (request.method === 'GET') {
        // Get session id from url
        let sessionId = url.searchParams.get('gameId');

        if (!sessionId) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Données manquantes' }));
            return;
        }

        getGame(sessionId).then((game) => {
            if (!game) {
                response.writeHead(404, { 'Content-Type': 'application/json' });
                response.end(
                    JSON.stringify({ error: 'Session de jeu inexistante' })
                );
                return;
            }

            if (game.player !== email) {
                response.writeHead(403, { 'Content-Type': 'application/json' });
                response.end(
                    JSON.stringify({
                        error: "Vous n'êtes pas autorisé à accéder à cette session de jeu",
                    })
                );
                return;
            }

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ gameData: game }));
        });
    }
}

function handleRank(request, response) {
    if (request.method === 'GET') {
        // Logique pour récupérer le classement des joueurs
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ rankData: 'données du classement ici' }));
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
    }
}

function handleProfile(request, response) {
    if (request.method !== 'GET' && request.method !== 'PUT') {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
        return;
    }

    let email = requireLogin(request, response);

    if (!email) {
        return;
    }

    if (request.method === 'GET') {
        getUser(email).then((user) => {
            if (!user) {
                response.writeHead(404, { 'Content-Type': 'application/json' });
                response.end(
                    JSON.stringify({ error: 'Utilisateur inexistant' })
                );
                return;
            }

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ userProfile: user }));
        });
        return;
    }

    if (request.method === 'PUT') {
        // We will require to send all fields, even if they are not modified see https://en.wikipedia.org/wiki/Create%2C_read%2C_update_and_delete#RESTful_APIs
        getJsonBody(request).then((body) => {
            if (!body.email || !body.username || !body.password) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Données manquantes' }));
                return;
            }

            if (body.email !== email) {
                response.writeHead(403, { 'Content-Type': 'application/json' });
                response.end(
                    JSON.stringify({
                        error: 'Vous ne pouvez pas modifier l email',
                    })
                );
                return;
            }

            return createOrUpdateUser(
                body.email,
                body.username,
                body.password,
                response,
                false
            );
        });
    }
}

function handleChat(request, response) {
    if (request.method === 'POST') {
        // Logique pour envoyer un message de chat
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Message envoyé' }));
    } else if (request.method === 'GET') {
        // Logique pour récupérer l'historique des messages
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(
            JSON.stringify({ chatHistory: 'historique des chats ici' })
        );
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
    }
}

function handleFriends(request, response) {
    if (request.method === 'GET') {
        // Logique pour récupérer la liste d'amis
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ friendsList: 'liste d amis ici' }));
    } else if (request.method === 'POST') {
        // Logique pour ajouter un ami
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Ami ajouté' }));
    } else if (request.method === 'DELETE') {
        // Logique pour supprimer un ami
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Ami supprimé' }));
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
    }
}

function handleCheckAction(request, response) {
    if (request.method === 'GET') {
        // Logique pour vérifier une action
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(
            JSON.stringify({ actionStatus: 'statut de l action ici' })
        );
    } else {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Méthode non autorisée' }));
    }
}

/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
 ** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
 ** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
 ** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
 ** are probably not the ones you will need. */
function addCors(response) {
    // Website you wish to allow to connect to your server.
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow.
    response.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    // Request headers you wish to allow.
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With,content-type'
    );
    // Set to true if you need the website to include cookies in the requests sent to the API.
    response.setHeader('Access-Control-Allow-Credentials', true);
}

function getJsonBody(request) {
    return new Promise((resolve) => {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk.toString();
        });

        request.on('end', () => {
            resolve(JSON.parse(body));
        });
    });
}

function requireLogin(request, response) {
    if (!request.headers.authorization) {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Non authentifié' }));
        return false;
    }

    let token = request.headers.authorization.split(' ')[1];

    try {
        var decoded = jwt.verify(token, secret);
        return decoded.email;
    } catch (err) {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Non authentifié' }));
        return false;
    }
}

function createOrUpdateUser(
    email,
    username,
    password,
    response,
    create = false
) {
    if (!email || !username || !password) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Données manquantes' }));
    }

    getUser(email).then((user) => {
        if (user && create) {
            response.writeHead(409, { 'Content-Type': 'application/json' });
            response.end(
                JSON.stringify({ error: 'Utilisateur déjà existant' })
            );
            return;
        }

        if (!user && !create) {
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Utilisateur inexistant' }));
            return;
        }

        // Hash the password
        password = crypto.createHash('sha512').update(password).digest('hex');

        createUser({ email, username, password }).then((newUser) => {
            if (!newUser) {
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(
                    JSON.stringify({
                        error: 'Erreur lors de la création de l utilisateur',
                    })
                );
                return;
            }

            response.writeHead(200, { 'Content-Type': 'application/json' });
            if (create) {
                response.end(
                    JSON.stringify({
                        message: 'Utilisateur enregistré avec succès',
                    })
                );
            } else {
                response.end(
                    JSON.stringify({
                        message: 'Utilisateur modifié avec succès',
                    })
                );
            }
        });
    });
}

exports.manage = manageRequest;
