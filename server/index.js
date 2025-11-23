const express = require('express');
const cors = require('cors');
const pool = require('./db');
const apiRoutes = require('./routes/api');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
pool.query(schemaSql)
    .then(() => console.log('Database schema initialized'))
    .catch(err => console.error('Error initializing database schema', err));

// API Routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
