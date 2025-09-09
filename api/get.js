export default async function handler(req, res) {
  // CORS (boleh kamu batasi ke domainmu nanti)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const r = await fetch(`https://api.jsonbin.io/v3/b/${process.env.BIN_ID}/latest`, {
      headers: { "X-Master-Key": process.env.JSONBIN_KEY }
    });
    const j = await r.json();
    return res.status(200).json(j.record || {});
  } catch (e) {
    return res.status(500).json({ error: "Fetch failed", detail: String(e) });
  }
}
