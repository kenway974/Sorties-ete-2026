export const runtime = "edge";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  };

  const [qfap, openagenda] = await Promise.allSettled([
    fetch(`${base}/functions/v1/import-qfap`, {
      method: "POST",
      headers,
      body: "{}",
    }),
    fetch(`${base}/functions/v1/import-openagenda`, {
      method: "POST",
      headers,
      body: "{}",
    }),
  ]);

  return Response.json({
    qfap: {
      ok: qfap.status === "fulfilled" && qfap.value.ok,
      status: qfap.status === "fulfilled" ? qfap.value.status : qfap.reason,
    },
    openagenda: {
      ok: openagenda.status === "fulfilled" && openagenda.value.ok,
      status:
        openagenda.status === "fulfilled"
          ? openagenda.value.status
          : openagenda.reason,
    },
  });
}
