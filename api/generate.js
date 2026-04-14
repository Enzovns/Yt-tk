export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { url, tone } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "Clé API manquante sur le serveur." });
  if (!url) return res.status(400).json({ error: "URL manquante." });

  const prompt = `Tu es un expert en création de contenu TikTok francophone viral.
L'utilisateur veut adapter une vidéo YouTube en français pour TikTok.
Lien YouTube : ${url}
Ton souhaité : ${tone}
Génère :
1. **Script TikTok en français** (30-60 secondes, accroches fortes)
2. **Texte à l'écran** (3-5 sous-titres courts)
3. **Description TikTok** (emojis, call-to-action, max 150 caractères)
4. **Hashtags** (10-15 hashtags français ET anglais)
5. **Conseil de montage** (1 astuce pour rendre la vidéo addictive)
Formate chaque section avec son titre en gras.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content?.map((b) => b.text || "").join("\n") || "";
    res.status(200).json({ result: text });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur : " + e.message });
  }
}
