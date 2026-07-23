import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';

export async function isMessageProcessed(consumerName, messageId, databasePool = pool) {
  const result = await databasePool.query(
    `SELECT 1
       FROM infra_eventing.processed_messages
      WHERE consumer_name = $1
        AND message_id = $2`,
    [consumerName, messageId]
  );
  return result.rowCount > 0;
}

export async function markMessageProcessed(consumerName, messageId, databasePool = pool) {
  const result = await databasePool.query(
    `INSERT INTO infra_eventing.processed_messages
      (processed_message_id, consumer_name, message_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (consumer_name, message_id) DO NOTHING
     RETURNING processed_message_id`,
    [randomUUID(), consumerName, messageId]
  );
  return result.rowCount > 0;
}

export default {
  isMessageProcessed,
  markMessageProcessed,
};
