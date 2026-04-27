import fs from 'fs';

const filePath = 'c:/Users/chira/UIS/Pooja/backend/controllers/adminController.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      SELECT
        u.id          AS pandit_id,
        u.name        AS pandit_name,
        u.phone,
        COUNT(pr.id)                     AS completed_pujas,
        COALESCE(SUM(pr.total_price), 0) AS total_earned,
        COALESCE((SELECT SUM(amount) FROM pandit_payouts WHERE pandit_id = u.id), 0) AS total_paid
      FROM users u
      LEFT JOIN puja_requests pr
        ON pr.pandit_id = u.id AND pr.status = 'completed'
      WHERE u.role = 'pandit'
      GROUP BY u.id, u.name, u.phone`;

const replacement = `      SELECT
        u.id          AS pandit_id,
        u.name        AS pandit_name,
        u.phone,
        COUNT(pr.id)                     AS completed_pujas,
        COALESCE(SUM(pr.total_price), 0) AS total_earned,
        COALESCE((SELECT SUM(amount) FROM pandit_payouts WHERE pandit_id = u.id), 0) AS total_paid,
        ppd.payment_method,
        ppd.account_holder_name,
        ppd.bank_name,
        ppd.bank_account_number,
        ppd.ifsc_code,
        ppd.upi_id
      FROM users u
      LEFT JOIN puja_requests pr
        ON pr.pandit_id = u.id AND pr.status = 'completed'
      LEFT JOIN partner_payment_details ppd
        ON ppd.user_id = u.id AND ppd.is_active = 1
      WHERE u.role = 'pandit'
      GROUP BY u.id, u.name, u.phone, ppd.id`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Replacement successful');
} else {
    console.log('Target not found');
}
