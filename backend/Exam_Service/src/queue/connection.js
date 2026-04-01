const amqp = require('amqplib');
const config = require('../config/email');

let connection = null;
let channel = null;

async function connect() {
  try {
    if (connection) {
      return connection;
    }

    console.log('🔄 Connecting to RabbitMQ...');
    connection = await amqp.connect(config.rabbitmq.url);
    
    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err.message);
      connection = null;
      channel = null;
    });

    connection.on('close', () => {
      console.log('⚠️  RabbitMQ connection closed. Reconnecting...');
      connection = null;
      channel = null;
      setTimeout(connect, 5000);
    });

    console.log('✅ Connected to RabbitMQ');
    return connection;
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error.message);
    console.log('⏳ Retrying in 5 seconds...');
    setTimeout(connect, 5000);
    return null;
  }
}

async function getChannel() {
  try {
    if (channel) {
      return channel;
    }

    const conn = await connect();
    if (!conn) {
      throw new Error('No RabbitMQ connection available');
    }

    channel = await conn.createChannel();
    
    // Declare all queues
    const queues = Object.values(config.rabbitmq.queues);
    for (const queue of queues) {
      await channel.assertQueue(queue, {
        durable: true,
        arguments: {
          'x-message-ttl': 86400000, // 24 hours
          'x-max-length': 10000
        }
      });
    }

    console.log('✅ Channel created and queues declared');
    return channel;
  } catch (error) {
    console.error('❌ Failed to create channel:', error.message);
    channel = null;
    throw error;
  }
}

async function closeConnection() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log('✅ RabbitMQ connection closed');
  } catch (error) {
    console.error('❌ Error closing RabbitMQ connection:', error.message);
  }
}

module.exports = {
  connect,
  getChannel,
  closeConnection
};
