const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'Exam_Bank',
  user: 'postgres',
  password: '123456',
});

async function resetPassword() {
  const password = 'Examora@123';
  const hash = await bcrypt.hash(password, 12);

  const accounts = [
    'admin@examora.local',
    'teacher1@examora.local',
    'teacher2@examora.local',
    'student1@examora.local',
    'student2@examora.local',
  ];

  for (const email of accounts) {
    await pool.query(
      "UPDATE user_db.users SET password_hash = $1 WHERE email = $2",
      [hash, email]
    );
    console.log(`Updated: ${email}`);
  }

  console.log(`\nAll 5 accounts now have password: ${password}`);
  await pool.end();
}

resetPassword().catch(console.error);
