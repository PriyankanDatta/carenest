const router = require('express').Router();
const { getDashboard, getPendingApprovals, processApproval, getAllUsers, updateUser, getAllBookings, getAllTickets } = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const requireRole  = require('../middleware/requireRole');

router.use(authenticate, requireRole('admin'));
router.get('/dashboard',      getDashboard);
router.get('/approvals',      getPendingApprovals);
router.put('/approvals/:id',  processApproval);
router.get('/users',          getAllUsers);
router.put('/users/:id',      updateUser);
router.get('/bookings',       getAllBookings);
router.get('/tickets',        getAllTickets);

module.exports = router;
