import { Redis } from "@upstash/redis";

/* Compteur de visites — une seule clé Redis incrémentée à chaque visite.
   Fonctionne avec les variables d'environnement injectées par l'intégration
   Vercel (KV_REST_API_*) ou par un compte Upstash direct (UPSTASH_REDIS_REST_*).

   GET  /api/views  → renvoie le total actuel sans l'incrémenter
   POST /api/views  → incrémente puis renvoie le nouveau total

   En cas d'absence de configuration ou d'erreur, renvoie { count: null }
   avec un code 200 : le site masque simplement le compteur. */

const KEY = "pjv:views";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!redis) {
    res.status(200).json({ count: null });
    return;
  }

  try {
    const value =
      req.method === "POST" ? await redis.incr(KEY) : (await redis.get(KEY)) ?? 0;
    res.status(200).json({ count: Number(value) || 0 });
  } catch (err) {
    res.status(200).json({ count: null });
  }
}
