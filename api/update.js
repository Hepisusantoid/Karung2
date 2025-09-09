export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PUT") return res.status(405).json({ error: "Method Not Allowed" });

  // Simple auth: Authorization: Bearer <APP_PASSWORD>
  const auth = (req.headers.authorization || "").split(" ")[1] || "";
  if (!auth || auth !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const record = body?.record || {};

    const r = await fetch(`https://api.jsonbin.io/v3/b/${process.env.BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": process.env.JSONBIN_KEY
      },
      body: JSON.stringify(record)
    });

    const j = await r.json();
    return res.status(r.ok ? 200 : r.status).json(j);
  } catch (e) {
    return res.status(500).json({ error: "Update failed", detail: String(e) });
  }
}
