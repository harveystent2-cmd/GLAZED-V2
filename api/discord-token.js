// api/discord-token.js
module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "method_not_allowed" });
      return;
    }

    const { code, redirect_uri } = req.body || {};
    if (!code || !redirect_uri) {
      res.status(400).json({ error: "missing_code_or_redirect_uri" });
      return;
    }

    const client_id = process.env.DISCORD_CLIENT_ID;
    const client_secret = process.env.DISCORD_CLIENT_SECRET;

    if (!client_id || !client_secret) {
      res.status(500).json({ error: "missing_discord_env_vars" });
      return;
    }

    const body = new URLSearchParams({
      client_id,
      client_secret,
      grant_type: "authorization_code",
      code,
      redirect_uri
    });

    const r = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    const data = await r.json();

    if (!r.ok) {
      res.status(400).json({ error: "discord_token_exchange_failed", details: data });
      return;
    }

    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: "server_error" });
  }
};
