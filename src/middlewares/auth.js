const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' })
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token inválido.' })
  }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token inválido.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.organizationId = decoded.id
    req.userRole = decoded.role

    return next()

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido.' })
  }
}