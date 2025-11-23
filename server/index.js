const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes/api');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB (Removed - using Google Sheets)

// API Routes
app.use('/api', apiRoutes);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
