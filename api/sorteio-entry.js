const {
  createSorteioEntry,
  findSorteioEntryByPhoneDigits,
  listSorteioEntries,
} = require("./_lib/supabase");

function normalizePhoneDigits(value) {
  return String(value || "").replace(/\D+/g, "");
}

function formatPhone(value) {
  const digits = normalizePhoneDigits(value);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return String(value || "").trim();
}

function pickRandomAvailableNumber(usedNumbers) {
  const available = [];
  for (let number = 1; number <= 1000; number += 1) {
    if (!usedNumbers.has(number)) {
      available.push(number);
    }
  }

  if (!available.length) return null;

  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const name = String(payload.name || "").trim();
    const phoneDigits = normalizePhoneDigits(payload.phone);

    if (!name || phoneDigits.length < 10 || phoneDigits.length > 11) {
      res.status(400).json({
        ok: false,
        error: "Informe nome e celular com DDD válido.",
      });
      return;
    }

    const existingEntry = await findSorteioEntryByPhoneDigits(phoneDigits);
    if (existingEntry) {
      res.status(200).json({
        ok: true,
        already_exists: true,
        entry: existingEntry,
      });
      return;
    }

    const entries = await listSorteioEntries();
    const usedNumbers = new Set((entries || []).map((item) => Number(item.raffle_number)));
    const raffleNumber = pickRandomAvailableNumber(usedNumbers);

    if (!raffleNumber) {
      res.status(409).json({
        ok: false,
        error: "Todos os números do sorteio já foram distribuídos.",
      });
      return;
    }

    const rows = await createSorteioEntry({
      name,
      phone: formatPhone(phoneDigits),
      phone_digits: phoneDigits,
      raffle_number: raffleNumber,
    });

    res.status(200).json({
      ok: true,
      already_exists: false,
      entry: rows[0] || null,
    });
  } catch (error) {
    console.error("sorteio-entry error", error);
    res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : "Não foi possível registrar a entrada no sorteio.",
    });
  }
};
