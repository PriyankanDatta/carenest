const router = require('express').Router();
const { createTicket, getTickets, getTicketById, addReply, updateTicketStatus } = require('../controllers/ticketController');
const authenticate = require('../middleware/auth');
const requireRole  = require('../middleware/requireRole');

router.use(authenticate);
router.post('/',            createTicket);
router.get('/',             getTickets);
router.get('/:id',          getTicketById);
router.post('/:id/reply',   addReply);
router.put('/:id/status',   requireRole('admin'), updateTicketStatus);

module.exports = router;
