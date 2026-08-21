module.exports = function requireRole(role) {
  return function (req, res, next) {
    if (req.userRole !== role) {
      return res.status(403).json({ error: 'Acesso não autorizado.' });
    }

    return next();
  };
};
