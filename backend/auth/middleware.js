// HealthSure Backend — Auth Middleware
// backend/auth/middleware.js
//
// Phase 2: Replace this placeholder with real JWT verification.
// This file is intentionally empty in Phase 1 (mock auth lives in frontend).

/**
 * verifyToken — Express middleware to verify JWT on protected routes.
 *
 * Usage (Phase 2+):
 *   router.get('/dashboard', verifyToken, dashboardController.get);
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function verifyToken(req, res, next) {
  // TODO (Phase 2): Implement JWT verification
  // const authHeader = req.headers['authorization'];
  // const token = authHeader?.split(' ')[1];
  // if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  // try {
  //   const payload = jwt.verify(token, process.env.JWT_SECRET);
  //   req.user = payload;
  //   next();
  // } catch {
  //   return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  // }
  next(); // Pass-through in Phase 1
}

/**
 * requireRole — Express middleware to enforce role-based access.
 *
 * Usage (Phase 2+):
 *   router.get('/admin-data', verifyToken, requireRole('government_admin'), controller.get);
 *
 * @param {...string} roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    // TODO (Phase 2): Implement role check after verifyToken sets req.user
    // if (!roles.includes(req.user?.role)) {
    //   return res.status(403).json({ success: false, message: 'Forbidden' });
    // }
    next(); // Pass-through in Phase 1
  };
}

module.exports = { verifyToken, requireRole };
