// /api/update.js
const REQUIRED_SEASONS = ["MT1 2023","MT2 2023","MT1 2024","MT2 2024","MT1 2025","MT2 2025"];

const emptySeason = () => ({
  customers: {},
  stock_current: 0,
  stock_history: [],
  fixed_costs: 0
});

function normalize(record) {
  // jika payload masih legacy (obj pelanggan), bungkus ke seasons
  if (!record || typeof record !== "object") return { seasons: Object.fromEntries(REQUIRED_SEASONS.map(s=>[s, emptySeason()])) };
  if (!record.seasons) {
    const schema = { seasons: Object.fromEntries(REQUIRED_SEASONS.map(s=>[s, emptySeason()])) };
    schema.seasons["MT2 2025"].customers = record;
    return schema;
  }
  // pastikan semua musim ada + field minimal
  for (const s of REQUIRED_SEASONS) {
    if (!record.seasons[s]) record.seasons[s] = emptySeason();
  }
  for (const key of Object.keys(record.seasons)) {
    const v = record.seasons[key] || {};
    record.seasons[key] = {
      customers: v.customers && typeof v.customers === "object" ? v.customers : {},
      stock_current: Number.isFinite(v.stock_current) ? v.stock_current : 0,
      stock_history: Array.isArray(v.stock_history) ? v.stock_history : [],
      fixed_costs: Number.isFinite(v.fixed_costs) ? v.fixed_costs : 0
    };
  }
  return record;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PUT") return res.status(405).json({ error: "Method Not Allowed" });

  // auth sederhana
  const auth = (req.headers.authorization || "").split(" ")[1] || "";
  if (!auth || auth !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const incoming = body?.record;

    const normalized = normalize(incoming);

    const r = await fetch(`https://api.jsonbin.io/v3/b/${process.env.BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": process.env.JSONBIN_KEY
      },
      body: JSON.stringify(normalized)
    });

    const j = await r.json();
    return res.status(r.ok ? 200 : r.status).json(j);
  } catch (e) {
    return res.status(500).json({ error: "Update failed", detail: String(e) });
  }
}
