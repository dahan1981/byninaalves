const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLICK_EVENTS_TABLE = "click_events";
const LINK_BIO_LINKS_TABLE = "link_bio_links";
const SORTEIO_ENTRIES_TABLE = "sorteio_entries";

function ensureEnv() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables.");
  }
}

function getRestUrl(path = "") {
  return `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`;
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
  return supabaseFetch(CLICK_EVENTS_TABLE, {
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

  return supabaseFetch(`${CLICK_EVENTS_TABLE}?${params.toString()}`, {
    method: "GET",
  });
}

async function listLinkBioLinks({ activeOnly = false } = {}) {
  const params = new URLSearchParams({
    select: "id,label,url,position,active,opens_new_tab",
    order: "position.asc",
  });

  if (activeOnly) {
    params.set("active", "eq.true");
  }

  return supabaseFetch(`${LINK_BIO_LINKS_TABLE}?${params.toString()}`, {
    method: "GET",
  });
}

async function createLinkBioLink(payload) {
  return supabaseFetch(LINK_BIO_LINKS_TABLE, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
}

async function updateLinkBioLink(id, payload) {
  return supabaseFetch(`${LINK_BIO_LINKS_TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
}

async function deleteLinkBioLink(id) {
  return supabaseFetch(`${LINK_BIO_LINKS_TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}

async function listSorteioEntries() {
  const params = new URLSearchParams({
    select: "id,name,phone,phone_digits,raffle_number,created_at",
    order: "created_at.desc",
  });

  return supabaseFetch(`${SORTEIO_ENTRIES_TABLE}?${params.toString()}`, {
    method: "GET",
  });
}

async function findSorteioEntryByPhoneDigits(phoneDigits) {
  const params = new URLSearchParams({
    select: "id,name,phone,phone_digits,raffle_number,created_at",
    phone_digits: `eq.${phoneDigits}`,
    limit: "1",
  });

  const rows = await supabaseFetch(`${SORTEIO_ENTRIES_TABLE}?${params.toString()}`, {
    method: "GET",
  });

  return rows && rows[0] ? rows[0] : null;
}

async function createSorteioEntry(payload) {
  return supabaseFetch(SORTEIO_ENTRIES_TABLE, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
}

async function deleteAllSorteioEntries() {
  return supabaseFetch(`${SORTEIO_ENTRIES_TABLE}?id=not.is.null`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}

module.exports = {
  createLinkBioLink,
  createSorteioEntry,
  deleteAllSorteioEntries,
  deleteLinkBioLink,
  findSorteioEntryByPhoneDigits,
  insertClickEvent,
  listLinkBioLinks,
  listClickEvents,
  listSorteioEntries,
  updateLinkBioLink,
};
