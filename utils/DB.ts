import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Create the pool ONCE and export it
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Needed for Render
    }
})

// Optional: test the connection on startup
export const connectDB = async () => {
    try {
        const client = await pool.connect()
        console.log('Connected to PostgreSQL')
        client.release()
    } catch (err) {
        console.error('Database connection error:', err)
        process.exit(1)
    }
}
