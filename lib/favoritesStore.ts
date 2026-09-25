export interface FavoriteQuestion {
  question_text: string;
  method: string;
  context: string;
  saves: number;
  last_saved_at: string;
}

const favorites = new Map<string, FavoriteQuestion>();

export function toggleFavorite(question_text: string, method: string, context: string, saved: boolean): FavoriteQuestion | null {
  const key = `${question_text}\u0000${method}\u0000${context}`;
  if (!saved) {
    favorites.delete(key);
    return null;
  }
  const existing = favorites.get(key);
  const favorite: FavoriteQuestion = {
    question_text,
    method,
    context,
    saves: existing?.saves ?? 1,
    last_saved_at: new Date().toISOString(),
  };
  favorites.set(key, favorite);
  return favorite;
}

export function listFavorites(): FavoriteQuestion[] {
  return Array.from(favorites.values()).sort((a, b) => b.last_saved_at.localeCompare(a.last_saved_at));
}
