import express from 'express';
import {
    signupRequest,
    signupVerify,
    loginRequest,
    verifyOtp,
    addAddress,
    getUserAddresses,
    setDefaultAddress,
    getSingleAddress,
    deleteAddress,
    updateAddress,
    addMember,
    allMembers,
    deleteMember, 
} from '../controllers/authController.js';

import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// -------- AUTH --------
router.post('/signup-request', signupRequest);
router.post('/signup-verify', signupVerify);
router.post('/login-request', loginRequest);
router.post('/verify-otp', verifyOtp);

// -------- ADDRESS --------
router.post('/add-address', verifyToken, addAddress);

router.get('/get-addresses', verifyToken, getUserAddresses);

router.put('/set-default/:id', verifyToken, setDefaultAddress);

router.get('/address/:id', verifyToken, getSingleAddress);

router.put('/update-address/:id', verifyToken, updateAddress);

router.delete("/delete-address/:id", verifyToken, deleteAddress);

// -------------ADD-Members-------------------
router.post('/add-member',verifyToken,addMember)
router.get('/get-members',verifyToken,allMembers)
router.delete("/delete-member/:id", verifyToken, deleteMember);

export default router;