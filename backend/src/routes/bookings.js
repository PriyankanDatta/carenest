const router = require('express').Router();
const { createBooking, getBookings, getBookingById, updateBookingStatus, mockPayment } = require('../controllers/bookingController');
const authenticate = require('../middleware/auth');
const requireRole  = require('../middleware/requireRole');

router.use(authenticate);
router.post('/',          requireRole('customer'), createBooking);
router.get('/',           getBookings);
router.get('/:id',        getBookingById);
router.put('/:id/status', updateBookingStatus);
router.post('/:id/pay',   requireRole('customer'), mockPayment);

module.exports = router;
