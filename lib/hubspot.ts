/**
 * HubSpot v3 REST API wrapper — server-side only.
 *
 * Design contract: every export is **safe** when `HUBSPOT_API_KEY` is unset
 * (demo mode). Errors are logged and swallowed; form submits must never fail
 * because HubSpot is unreachable.
 *
 * We hit the REST endpoints with `fetch` directly to avoid pulling the SDK
 * into the server bundle. Token is a Private App access token (Bearer auth).
 */
import "server-only";

const BASE = "https://api.hubapi.com";

export function hubspotEnabled() {
  return Boolean(process.env.HUBSPOT_API_KEY);
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function hsFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers ?? {}) },
    // Never cache; these are mutations or near-real-time reads.
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[hubspot] ${init?.method ?? "GET"} ${path} → ${res.status} ${body.slice(0, 300)}`
    );
  }
  return res.json() as Promise<Record<string, unknown>>;
}

/* ───────────────────────────────────────────────────── CONTACTS */

export type UpsertContactInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string | null;
  /** Optional free-form lifecyclestage override (e.g. "lead", "marketingqualifiedlead"). */
  lifecycleStage?: string;
  /** Extra custom HubSpot properties to set. */
  extra?: Record<string, string | number | boolean>;
};

/**
 * Upsert a Contact by email. Returns the HubSpot contact ID or `null` if
 * HubSpot is disabled or the call failed (logged, not thrown).
 */
export async function upsertContact(input: UpsertContactInput): Promise<string | null> {
  if (!hubspotEnabled()) return null;

  const properties: Record<string, string | number | boolean> = {
    email: input.email,
    ...(input.firstName ? { firstname: input.firstName } : {}),
    ...(input.lastName ? { lastname: input.lastName } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.company ? { company: input.company } : {}),
    ...(input.lifecycleStage ? { lifecyclestage: input.lifecycleStage } : {}),
    ...(input.extra ?? {}),
  };

  try {
    // Search by email
    const search = (await hsFetch("/crm/v3/objects/contacts/search", {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [{ propertyName: "email", operator: "EQ", value: input.email }],
          },
        ],
        properties: ["email"],
        limit: 1,
      }),
    })) as { results?: Array<{ id: string }> };

    const existingId = search.results?.[0]?.id ?? null;
    if (existingId) {
      await hsFetch(`/crm/v3/objects/contacts/${existingId}`, {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      });
      return existingId;
    }

    const created = (await hsFetch("/crm/v3/objects/contacts", {
      method: "POST",
      body: JSON.stringify({ properties }),
    })) as { id?: string };
    return created.id ?? null;
  } catch (err) {
    console.error("[hubspot.upsertContact]", err);
    return null;
  }
}

/* ───────────────────────────────────────────────────── DEALS */

export type CreateDealInput = {
  contactId: string;
  dealName: string;
  amount?: number | null;
  /** Optional initial pipeline stage override. Defaults to HUBSPOT_STAGE_NEW. */
  stage?: string;
  /** Extra HubSpot deal properties. */
  extra?: Record<string, string | number | boolean>;
};

export async function createDeal(input: CreateDealInput): Promise<string | null> {
  if (!hubspotEnabled()) return null;
  const pipeline = process.env.HUBSPOT_PIPELINE;
  const stage = input.stage ?? process.env.HUBSPOT_STAGE_NEW;

  const properties: Record<string, string | number | boolean> = {
    dealname: input.dealName,
    ...(input.amount != null ? { amount: input.amount } : {}),
    ...(pipeline ? { pipeline } : {}),
    ...(stage ? { dealstage: stage } : {}),
    ...(input.extra ?? {}),
  };

  try {
    const deal = (await hsFetch("/crm/v3/objects/deals", {
      method: "POST",
      body: JSON.stringify({
        properties,
        associations: [
          {
            to: { id: input.contactId },
            types: [
              {
                // Standard HubSpot association type id: deal_to_contact = 3
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 3,
              },
            ],
          },
        ],
      }),
    })) as { id?: string };
    return deal.id ?? null;
  } catch (err) {
    console.error("[hubspot.createDeal]", err);
    return null;
  }
}

/**
 * Move a deal to a stage. `stageKey` may be a logical key
 * (`new` | `qualified` | `quoteSent` | `closedwon` | `closedlost`)
 * which we map to env-configured stage IDs, OR a raw HubSpot stage ID.
 */
export type StageKey =
  | "new"
  | "qualified"
  | "quoteSent"
  | "closedwon"
  | "closedlost";

function resolveStageId(key: StageKey | string): string | null {
  switch (key) {
    case "new":
      return process.env.HUBSPOT_STAGE_NEW ?? null;
    case "qualified":
      return process.env.HUBSPOT_STAGE_QUALIFIED ?? null;
    case "quoteSent":
      return process.env.HUBSPOT_STAGE_QUOTE_SENT ?? null;
    case "closedwon":
      return process.env.HUBSPOT_STAGE_CLOSED_WON ?? null;
    case "closedlost":
      return process.env.HUBSPOT_STAGE_CLOSED_LOST ?? null;
    default:
      // Treat as raw stage ID
      return typeof key === "string" && key.length > 0 ? key : null;
  }
}

export async function updateDealStage(
  dealId: string | null | undefined,
  stage: StageKey | string,
  extra?: Record<string, string | number | boolean>
): Promise<void> {
  if (!hubspotEnabled() || !dealId) return;
  const stageId = resolveStageId(stage);
  if (!stageId) {
    console.warn(`[hubspot.updateDealStage] no stage id resolved for "${stage}"`);
    return;
  }
  try {
    await hsFetch(`/crm/v3/objects/deals/${dealId}`, {
      method: "PATCH",
      body: JSON.stringify({
        properties: {
          dealstage: stageId,
          ...(extra ?? {}),
        },
      }),
    });
  } catch (err) {
    console.error("[hubspot.updateDealStage]", err);
  }
}
