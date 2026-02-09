import express from 'express';
import {userBookingDetailController, bookings} from '../controllers/userBookingDetailController.js';
import { verifyToken } from '../middleware/auth.js';


// get deatils for booking
const router = express.Router();

router.get('/details', verifyToken, userBookingDetailController);
router.post('/bookings',verifyToken, bookings)
export default router;
