// api/discord-invite.js
// Fetch Discord invite metadata (guild name/icon) without exposing secrets.
// Works with public invites.

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "method_not_allowed" });
      return;
    }

    const invite = (req.query?.invite || "").trim();
    if (!invite) {
      res.status(400).json({ error: "missing_invite" });
      return;
    }

    const url = `https://discord.com/api/v10/invites/${encodeURIComponent(
      invite
    )}?with_counts=true&with_expiration=true`;

    const r = await fetch(url, { method: "GET" });
    const data = await r.json();

    if (!r.ok) {
      res.status(400).json({ error: "discord_invite_fetch_failed", details: data });
      return;
    }

    const guild = data.guild || null;
    const out = {
      invite: data.code,
      guild: guild
        ? {
            id: guild.id,
            name: guild.name,
            icon: guild.icon || null,
            icon_url: guild.icon
              ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
              : null,
            approximate_member_count: data.approximate_member_count ?? null,
            approximate_presence_count: data.approximate_presence_count ?? null
          }
        : null
    };

    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: "server_error" });
  }
}
