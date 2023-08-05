// Middleware to check JWT token
function verifyToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access denied, token not provided' });
    }
  
    jwt.verify(token, process.env.SECRET_ADMIN_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      if (!decoded.isAdmin) {
        return res.status(403).json({ error: 'You are not authorized as an admin' });
      }
      req.admin = decoded; // Save decoded admin data for future use
      next();
    });
  }

  module.exports = verifyToken