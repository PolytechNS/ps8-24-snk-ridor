var crypto = require('crypto')

function sign(payload, secret) {
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

function verify(token, secret) {
    let [header, payload, sig] = token.split('.')

    let hmac = crypto.createHmac('sha256', secret)

    let sig2 = hmac.update(
        Buffer.from(header).toString('base64url') +
            '.' +
            Buffer.from(payload).toString('base64url'),
        secret
    )

    return sig === sig2.digest('base64url')
}

exports.sign = sign
exports.verify = verify
