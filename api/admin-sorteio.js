const { deleteAllSorteioEntries, listSorteioEntries } = require("./_lib/supabase");

const PASSWORD = process.env.ADMIN_PASSWORD;

function ensureAuthorized(req, res) {
  if (!PASSWORD) {
    res.status(500).json({ ok: false, error: "Missing ADMIN_PASSWORD environment variable." });
    return false;
  }

  const providedPassword = req.headers["x-admin-password"];
  if (!providedPassword || providedPassword !== PASSWORD) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return false;
  }

  return true;
}

function escapeCsv(value) {
  const raw = String(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

function toCsv(entries) {
  const header = ["nome", "celular", "numero_sorteado", "criado_em"];
  const rows = entries.map((entry) => [
    escapeCsv(entry.name),
    escapeCsv(entry.phone),
    escapeCsv(entry.raffle_number),
    escapeCsv(entry.created_at),
  ]);

  return [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

module.exports = async function handler(req, res) {
  if (!ensureAuthorized(req, res)) return;

  try {
    if (req.method === "DELETE") {
      await deleteAllSorteioEntries();
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ ok: false, error: "Method not allowed." });
      return;
    }

    const entries = await listSorteioEntries();

    if (req.query.format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=sorteio-relatorio.csv");
      res.status(200).send(toCsv(entries || []));
      return;
    }

    const numbersTaken = new Set((entries || []).map((entry) => Number(entry.raffle_number)));
    const stats = {
      total_entries: (entries || []).length,
      available_numbers: 1000 - numbersTaken.size,
      latest_number: entries && entries[0] ? entries[0].raffle_number : "-",
    };

    res.status(200).json({
      ok: true,
      entries: entries || [],
      stats,
    });
  } catch (error) {
    console.error("admin-sorteio error", error);
    res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : "Não foi possível carregar o sorteio.",
    });
  }
};
