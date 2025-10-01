// pages/upload.tsx (or app/upload/page.tsx)
import React from 'react';
import VideoUpload from '../videoupload/page';

const UploadPage: React.FC = () => {
  return <VideoUpload />;
};

export default UploadPage;

// api/mux/create-upload.ts (Pages Router)
import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';

interface MuxUploadResponse {
  upload_url: string;
  asset_id: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MuxUploadResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      new_asset_settings: {
        playback_policy: ['public'] as const,
        encoding_tier: 'baseline' as const,
        input: [{
          url: undefined, // Will be set by the upload
        }],
      },
    });

    if (!upload.url || !upload.asset_id) {
      throw new Error('Invalid response from Mux API');
    }

    res.status(200).json({
      upload_url: upload.url,
      asset_id: upload.asset_id,
    });
  } catch (error) {
    console.error('Mux upload creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create upload URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
