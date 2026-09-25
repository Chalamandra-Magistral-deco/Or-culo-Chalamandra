import type { NextApiRequest, NextApiResponse } from 'next';
import { listFavorites } from '../../lib/favoritesStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método no permitido' });
  return res.status(200).json({ favorites: listFavorites() });
}
