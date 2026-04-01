import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/save', async (req, res) => {
    const { user_id, payment_method, account_holder_name, bank_name, bank_account_number, ifsc_code, upi_id } = req.body;
    if (!payment_method || !['bank', 'upi'].includes(payment_method))
        return res.status(400).json({ message: 'payment_method bank ya upi hona chahiye.' });
    if (payment_method === 'bank') {
        if (!account_holder_name || !bank_name || !bank_account_number || !ifsc_code)
            return res.status(400).json({ message: 'Sabhi bank details required hain.' });
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code.toUpperCase()))
            return res.status(400).json({ message: 'Invalid IFSC code format.' });
    }
    if (payment_method === 'upi') {
        if (!upi_id || !upi_id.includes('@'))
            return res.status(400).json({ message: 'Valid UPI ID required.' });
    }
    try {
        await pool.query('UPDATE partner_payment_details SET is_active = FALSE WHERE user_id = ?', [user_id]);
        const [result] = await pool.query('INSERT INTO partner_payment_details (user_id, payment_method, account_holder_name, bank_name, bank_account_number, ifsc_code, upi_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [user_id, payment_method, account_holder_name || null, bank_name || null, bank_account_number || null, ifsc_code ? ifsc_code.toUpperCase() : null, upi_id || null]);
        return res.status(201).json({ message: 'Payment details save ho gayi.', payment_id: result.insertId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
    }
});

router.get('/me/:user_id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, payment_method, account_holder_name, bank_name, ifsc_code, upi_id, is_verified, created_at FROM partner_payment_details WHERE user_id = ? AND is_active = TRUE LIMIT 1', [req.params.user_id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Koi payment detail nahi mili.' });
        return res.status(200).json({ payment: rows[0] });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
});

router.get('/all', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT u.id AS user_id, u.name, u.phone, ppd.payment_method, ppd.account_holder_name, ppd.bank_name, ppd.ifsc_code, ppd.upi_id, ppd.is_verified, ppd.created_at FROM partner_payment_details ppd JOIN users u ON u.id = ppd.user_id WHERE ppd.is_active = TRUE ORDER BY ppd.created_at DESC');
        return res.status(200).json({ total: rows.length, payments: rows });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
});

router.patch('/verify/:id', async (req, res) => {
    try {
        await pool.query('UPDATE partner_payment_details SET is_verified = TRUE, verified_at = NOW() WHERE id = ?', [req.params.id]);
        return res.status(200).json({ message: 'Payment detail verified.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
