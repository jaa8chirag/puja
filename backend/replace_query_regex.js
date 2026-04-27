import fs from 'fs';

const filePath = 'c:/Users/chira/UIS/Pooja/backend/controllers/adminController.js';
let content = fs.readFileSync(filePath, 'utf8');

// Use a more flexible regex to find the query
const regex = /SELECT\s+u\.id\s+AS\s+pandit_id,[\s\S]+?COALESCE\(\(SELECT\s+SUM\(amount\)\s+FROM\s+pandit_payouts\s+WHERE\s+pandit_id\s+=\s+u\.id\),\s+0\)\s+AS\s+total_paid\s+FROM\s+users\s+u\s+LEFT\s+JOIN\s+puja_requests\s+pr\s+ON\s+pr\.pandit_id\s+=\s+u\.id\s+AND\s+pr\.status\s+=\s+'completed'\s+WHERE\s+u\.role\s+=\s+'pandit'\s+GROUP\s+BY\s+u\.id,\s+u\.name,\s+u\.phone/;

const replacement = `SELECT
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

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Replacement successful');
} else {
    console.log('Regex did not match');
}
