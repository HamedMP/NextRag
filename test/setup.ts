import { beforeAll, afterAll } from 'vitest';
import { query } from '../src/lib/db/pg';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Setup function to create test tables and extensions
async function setupTestDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS test_vectors (
      id SERIAL PRIMARY KEY,
      content TEXT,
      embedding vector(1536),
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Cleanup function to drop test tables
async function cleanupTestDB() {
  await query('DROP TABLE IF EXISTS test_vectors');
}

// Run before all tests
beforeAll(async () => {
  await cleanupTestDB(); // Clean any existing test data
  await setupTestDB();
});

// Run after all tests
afterAll(async () => {
  await cleanupTestDB();
});
