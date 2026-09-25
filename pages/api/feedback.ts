import type { NextApiRequest, NextApiResponse } from 'next';
import { QUESTION_BANK } from '../../lib/questionBank';
import { toggleFavorite } from '../../lib/favoritesStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });
  const { question, method, context, saved } = req.body ?? {};
  const validMethod = QUESTION_BANK.some((item) => item.name === method);
  if (typeof question !== 'string' || !question.trim() || !validMethod || typeof context !== 'string' || typeof saved !== 'boolean') {
    return res.status(400).json({ message: 'Datos de feedback inválidos.' });
  }
  return res.status(200).json({ favorite: toggleFavorite(question.trim(), method, context, saved) });
}
