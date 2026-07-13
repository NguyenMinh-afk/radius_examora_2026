import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'postgres-db',
  port: 5432,
  database: 'Exam_Bank',
  user: 'postgres',
  password: '123456'
});

const password = process.env.SEED_PASSWORD || 'Examora@123';
const hash = await bcrypt.hash(password, 12);

for (const email of [
  'admin@examora.local',
  'teacher1@examora.local',
  'teacher2@examora.local',
  'student1@examora.local',
  'student2@examora.local'
]) {
  await pool.query('UPDATE user_db.users SET password_hash = $1 WHERE email = $2', [hash, email]);
  console.log('Updated: ' + email);
}

console.log('All 5 accounts now have password: ' + password);
await pool.end();
