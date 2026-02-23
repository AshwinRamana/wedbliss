const express = require('express');
const router = express.Router();
const awsService = require('../services/aws');

// ── GET /api/upload/presigned-url — Generate S3 upload URL ────────────────
router.get('/presigned-url', async (req, res) => {
    try {
        const { fileName, fileType } = req.query;

        if (!fileName || !fileType) {
            return res.status(400).json({ error: 'fileName and fileType are required query parameters' });
        }

        // Only allow image uploads for gallery
        if (!fileType.startsWith('image/')) {
            return res.status(400).json({ error: 'Only image files are allowed' });
        }

        const data = await awsService.generatePresignedUrl(fileName, fileType);

        if (data.error) {
            return res.status(500).json({ error: data.error });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('[upload] Server error:', err);
        res.status(500).json({ error: 'Internal server error while generating URL' });
    }
});

module.exports = router;
