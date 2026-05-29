const router = require('express').Router();
const { browseCaregivers, getCaregiverProfile, getMyProfile, updateMyProfile } = require('../controllers/caregiverController');
const authenticate  = require('../middleware/auth');
const requireRole   = require('../middleware/requireRole');

router.get('/',           browseCaregivers);
router.get('/my-profile', authenticate, requireRole('caregiver'), getMyProfile);
router.put('/my-profile', authenticate, requireRole('caregiver'), updateMyProfile);
router.get('/:id',        getCaregiverProfile);

module.exports = router;
