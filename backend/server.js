const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const invitationRoutes = require('./routes/invitations');
const domainRoutes = require('./routes/domains');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: '*' })); // For dev, allow all origins
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
