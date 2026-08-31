import { Router } from 'express';
import crypto from 'crypto';
import { requireFarmerAuth } from '../middleware/requireFarmerAuth.js';

const router = Router();

// The browser uploads the actual file straight to Cloudinary (never through
// our server) but can only do so with a signature this endpoint issues --
// signed with a secret only the backend holds, scoped to the caller's own
// farm folder. A farmer can't forge a signature for someone else's folder.
router.post('/signature', requireFarmerAuth, (req, res) => {
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({ error: 'Image uploads are not configured on the server yet' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `flockguard/${req.farmId}`;
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
    .digest('hex');

  res.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

export default router;
