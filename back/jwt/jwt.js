const crypto = require('crypto')

// get secret from env
let default_secret =
    'Zo2yU9#sB9ZBtruAip*^XAEW4ectaXvfokK^D8sSdVwahBf*JuuJ2Jr$!jd!zE6eikA'
let secret = process.env.JWT_SECRET || default_secret

function _sign(payload, secret) {
    let header = {
        alg: 'HS256',
        typ: 'JWT',
    }

    let hmac = crypto.createHmac('sha256', secret)

    let sig = hmac.update(
        Buffer.from(JSON.stringify(header)).toString('base64url') +
            '.' +
            Buffer.from(JSON.stringify(payload)).toString('base64url'),
        secret
    )

    return (
        Buffer.from(JSON.stringify(header)).toString('base64url') +
        '.' +
        Buffer.from(JSON.stringify(payload)).toString('base64url') +
        '.' +
        sig.digest('base64url')
    )
}

function _verify(token, secret) {
    let [header, payload, sig] = token.split('.')

    let hmac = crypto.createHmac('sha256', secret)

    let sig2 = hmac.update(header + '.' + payload, secret)

    return sig === sig2.digest('base64url')
}

function sign(payload) {
    if (secret === default_secret) {
        console.warn(
            'Warning: JWT_SECRET is not set, using default secret. This is not secure!'
        )
    }
    return _sign(payload, secret)
}

function parse(token) {
    let [header, payload, sig] = token.split('.')

    return {
        header: JSON.parse(Buffer.from(header, 'base64url').toString('utf8')),
        payload: JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')),
        sig: sig,
    }
}

function verify(token) {
    if (secret === default_secret) {
        console.warn(
            'Warning: JWT_SECRET is not set, using default secret. This is not secure!'
        )
    }
    return _verify(token, secret)
}

exports.sign = sign
exports.verify = verify
exports.parse = parse
