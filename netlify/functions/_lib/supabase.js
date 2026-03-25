const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE_NAME = "click_events";

function ensureEnv() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables.");
  }
}

function getRestUrl(path = "") {
  const base = SUPABASE_URL.replace(/\/$/, "");
  return `${base}/rest/v1/${path}`;
}

async function supabaseFetch(path, options = {}) {
  ensureEnv();

  const response = await fetch(getRestUrl(path), {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function insertClickEvent(payload) {
  return supabaseFetch(TABLE_NAME, {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });
}

async function listClickEvents({ fromIso }) {
  const params = new URLSearchParams({
    select: "link_id,clicked_at,destination_url",
    page_key: "eq.link_bio",
    order: "clicked_at.desc",
  });

  if (fromIso) {
    params.set("clicked_at", `gte.${fromIso}`);
  }

  return supabaseFetch(`${TABLE_NAME}?${params.toString()}`, {
    method: "GET",
  });
}

module.exports = {
  insertClickEvent,
  listClickEvents,
};
