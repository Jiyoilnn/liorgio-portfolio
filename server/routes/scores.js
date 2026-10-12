/**
 *   GET  /api/scores/:game        top 10
 *   POST /api/scores/:game        { name, score }  -> { rank }
 *
 * Games: "reaction" (lower ms is better) and "quiz" (higher points are better).
 *
 * HONEST NOTE: a client-side game can always be cheated (anyone can POST a fake
 * score). That's fine for a fun leaderboard, but for anything with real stakes the
 * server would have to run the game logic itself.
 */
import { HttpError } from '../http-utils.js';
import { validateScore, GAME_RULES } from '../../public/js/shared/validators.js';
import { insertScore, topScores } from '../../public/js/shared/leaderboard.js';

export function registerScores(router, { store }) {
  router.get('/api/scores/:game', ({ params }) => {
    if (!GAME_RULES[params.game]) throw new HttpError(404, 'Unknown game.');
    return { body: { game: params.game, order: GAME_RULES[params.game].order, scores: topScores(store.data.scores, params.game) } };
  });

  router.post('/api/scores/:game', async ({ params, body }) => {
    const v = validateScore(params.game, await body());
    if (!v.ok) throw new HttpError(422, 'Invalid score.', v.errors);
    const rank = await store.update((data) => insertScore(data.scores, params.game, v.value));
    return { status: 201, body: { rank } };
  });
}
