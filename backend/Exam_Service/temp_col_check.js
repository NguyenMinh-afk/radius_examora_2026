const { Client } = require('pg');
const client = new Client({
  host: 'backend-postgres-db-1',
  database: 'exam_db',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
});
client.connect()
  .then(() => client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'exam_db' AND table_name = 'classes'`))
  .then(r => console.log(JSON.stringify(r.rows, null, 2)))
  .catch(e => console.error(e.message))
  .finally(() => client.end());
