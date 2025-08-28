require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Username:', process.env.DB_USERNAME);
    console.log('Database:', process.env.DB_DATABASE);
    console.log('Password:', process.env.DB_PASSWORD ? '***set***' : '***empty***');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);

    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solution: Check your DB_USERNAME and DB_PASSWORD in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Make sure MySQL is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Solution: Create the database first: CREATE DATABASE file_upload_db;');
    }
  }
}

testConnection();
