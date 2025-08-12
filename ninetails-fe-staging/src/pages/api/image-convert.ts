import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || Array.isArray(url)) {
    return res.status(400).json({ error: 'URL is required and must be a string' });
  }

  try {
    const response = await fetch(url as string, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(300) // Resize width to 300px, height auto
      .toBuffer();

    const base64Image = resizedImageBuffer.toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';

    res.setHeader('Content-Type', 'application/json');
    res.json({ image: `data:${contentType};base64,${base64Image}` });
  } catch (error) {
    console.error('Error fetching or processing image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
