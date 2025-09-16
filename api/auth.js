// /api/auth.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const auth = (req.headers.authorization || "").split(" ")[1] || "";
  if (!auth || auth !== process.env.APP_PASSWORD) {
    return res.status(401).json({ ok:false });
  }
  return res.status(200).json({ ok:true });
}
