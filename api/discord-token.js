export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { code, redirect_uri } = body || {};

    if (!code || !redirect_uri) {
      return res.status(400).json({
        error: "missing_code_or_redirect_uri",
        got: { code: !!code, redirect_uri }
      });
    }

    const client_id = process.env.DISCORD_CLIENT_ID;
    const client_secret = process.env.DISCORD_CLIENT_SECRET;

    if (!client_id || !client_secret) {
      return res.status(500).json({
        error: "missing_env_vars",
        has_client_id: !!client_id,
        has_client_secret: !!client_secret
      });
    }

    const params = new URLSearchParams({
      client_id,
      client_secret,
      grant_type: "authorization_code",
      code,
      redirect_uri
    });

    const r = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(400).json({
        error: "discord_error",
        status: r.status,
        discord: data
      });
    }

    res.status(200).json(data);
  } catch (err) {
