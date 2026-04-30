import db from '../config/db.js';

async function check() {
  try {
    const [cols1] = await db.query('DESCRIBE services');
    console.log('services columns:', cols1.map(c => c.Field));
    
    const [cols2] = await db.query('DESCRIBE users');
    console.log('users columns:', cols2.map(c => c.Field));

    const [cols3] = await db.query('DESCRIBE pandits');
    console.log('pandits columns:', cols3.map(c => c.Field));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

check();
