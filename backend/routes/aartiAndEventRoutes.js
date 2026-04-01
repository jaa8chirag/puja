import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
    getMandirList, getMandirDetails, addMandir, deleteMandir,
    getAllEvents, getAllAartis, addContent, deleteContent 
} from '../controllers/aartiAndEventController.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Mandir Routes
router.get('/mandir/all', getMandirList);
router.get('/mandir/:id', getMandirDetails); // Detail route fix
router.post('/mandir/add', upload.single('image'), addMandir);
router.delete('/mandir/delete/:id', deleteMandir);

// Events & Aarti Routes
router.get('/events', getAllEvents);
router.get('/aartis', getAllAartis);
router.post('/add', upload.single('image'), addContent);
router.delete('/delete/:type/:id', deleteContent);

export default router;