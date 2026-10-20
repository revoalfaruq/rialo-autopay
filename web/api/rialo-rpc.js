export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body ?? {});

    const upstream = await fetch("https://devnet.rialo.io:4101", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });

    const responseText = await upstream.text();

    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json"
    );

    return res.status(upstream.status).send(responseText);
  } catch (error) {
    console.error("Rialo RPC proxy error:", error);
    return res.status(502).json({
      error: "Unable to reach Rialo DevNet RPC"
    });
  }
}
