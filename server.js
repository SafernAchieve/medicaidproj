const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const axios = require('axios');

const app = express();
const port = 4000;

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

app.use(express.json());

const config = {
    user: 'consentuser',
    password: '1e5kNEqUser3kvikVqKx',
    server: 'achieveazuresql01.database.windows.net',
    database: 'netsmart',
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
    }
};


app.get('/api/people/data', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query(`
            SELECT 
                p.people_id,
                p.last_name,
                p.first_name,
                p.npi_number
            FROM people p
            WHERE p.npi_number IS NOT NULL
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        sql.close();
    }
});













app.get('/api/people', async (req, res) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT 
                p.people_id,
                p.last_name,
                p.first_name,
                p.npi_number
            FROM people p
            WHERE p.people_id ='E8F3B616-EECD-EA11-80D6-005056815184'
        `);

        const person = result.recordset[0];
        if (!person) {
            return res.status(404).json({ error: 'Person not found' });
        }

        const npiNumber = person.npi_number;
        let npiApiData = [];
        let npiDate = null;
        if (npiNumber) {
            try {
                const url = `https://health.data.ny.gov/resource/keti-qx5t.json?npi=${npiNumber}`;
                const response = await axios.get(url);
                npiApiData = response.data;
             if (npiApiData.length > 0) {
  npiDate = npiApiData[0].next_anticipated_revalidation_date || null;
  npiApiData = []; // Clear the rest if you only want the date
}

            } catch (apiErr) {
                console.error('NPI API error:', apiErr.message);
            }
        }

        res.json({
            person,
            npiApiData,
            npiDate
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        if (pool && pool.close) await pool.close();
    }
});





// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        status: 'error',
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing pool...');
    if (sql.pool) {
        try {
            await sql.pool.close();
            console.log('Pool closed successfully');
        } catch (err) {
            console.error('Error closing pool:', err);
        }
    }
    process.exit(0);
});


const PORT = process.env.PORT || 4000; // Use the Azure-assigned port or fallback to 4000
const HOST = "0.0.0.0"; // Bind to all available interfaces

const server = app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT}`);
  });
