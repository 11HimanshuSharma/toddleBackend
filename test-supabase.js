const { Pool } = require('pg');
require('dotenv').config();

// Test Supabase connection
const testSupabaseConnection = async () => {
  const pool = new Pool({
    host: 'db.salfluqphirzetjkpkyd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.DB_PASSWORD, // You need to set this
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Testing Supabase connection...');
    const client = await pool.connect();
    console.log('✅ Connected to Supabase successfully!');
    
    // Test query
    const result = await client.query('SELECT version()');
    console.log('📊 Database version:', result.rows[0].version);
    
    client.release();
    await pool.end();
    console.log('🎉 Connection test completed successfully!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('password')) {
      console.log('💡 Hint: Check your database password');
    }
    if (error.message.includes('connect ENOTFOUND')) {
      console.log('💡 Hint: Check your host address');
    }
  }
};

testSupabaseConnection();
