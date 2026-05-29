const router = require('express').Router();
const { getAgencyProfile, updateAgencyProfile, getRoster, addToRoster, removeFromRoster, getAgencyBookings } = require('../controllers/agencyController');
const authenticate = require('../middleware/auth');
const requireRole  = require('../middleware/requireRole');

router.use(authenticate, requireRole('agency'));
router.get('/profile',             getAgencyProfile);
router.put('/profile',             updateAgencyProfile);
router.get('/roster',              getRoster);
router.post('/roster',             addToRoster);
router.delete('/roster/:caregiverId', removeFromRoster);
router.get('/bookings',            getAgencyBookings);

module.exports = router;
