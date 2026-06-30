// Supabase Edge Function: send-confirmation
// Sends a confirmation email when a user registers for an activity.
// Called with POST { userId, activityId }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Graceful degradation when RESEND_API_KEY is not configured
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let userId: string;
  let activityId: string;
  try {
    const body = await req.json();
    userId = body.userId;
    activityId = body.activityId;
    if (!userId || !activityId) throw new Error("Missing userId or activityId");
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Invalid body" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Build Supabase admin client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Fetch user email from auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
  if (authError || !authUser?.user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userEmail = authUser.user.email;
  if (!userEmail) {
    return new Response(JSON.stringify({ error: "User has no email" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch username from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();
  const username: string = profile?.username ?? "Participant";

  // Fetch activity details
  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .select("id, title, date, time, address, external_url")
    .eq("id", activityId)
    .single();

  if (activityError || !activity) {
    return new Response(JSON.stringify({ error: "Activity not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Format date for display (FR locale)
  const formattedDate = (() => {
    try {
      return new Date(activity.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return activity.date as string;
    }
  })();

  // Build HTML email body
  const externalUrlBlock =
    activity.external_url
      ? `<p style="margin:0 0 8px">
           <a href="${activity.external_url}" style="color:#0a1832;font-weight:600;">
             Voir la page de l'événement →
           </a>
         </p>`
      : "";

  const htmlBody = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Inscription confirmée</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a1832 0%,#1e3a5f 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#f5c842;font-size:28px;letter-spacing:-.5px;">MoodMap</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,.7);font-size:14px;">Votre agenda des sorties parisiennes</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#0a1832;font-size:22px;">
                Inscription confirmée ✓
              </h2>
              <p style="margin:0 0 24px;color:#555;font-size:15px;">
                Bonjour ${username},<br/>
                votre inscription à l'activité suivante a bien été enregistrée.
              </p>

              <!-- Activity card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;border-left:4px solid #f5c842;padding:20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <h3 style="margin:0 0 16px;color:#0a1832;font-size:18px;">${activity.title}</h3>
                    <p style="margin:0 0 8px;color:#444;font-size:14px;">
                      📅 <strong>Date :</strong> ${formattedDate}
                    </p>
                    ${
                      activity.time
                        ? `<p style="margin:0 0 8px;color:#444;font-size:14px;">
                             🕐 <strong>Heure :</strong> ${activity.time}
                           </p>`
                        : ""
                    }
                    <p style="margin:0 0 8px;color:#444;font-size:14px;">
                      📍 <strong>Adresse :</strong> ${activity.address}
                    </p>
                    ${externalUrlBlock}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#777;font-size:13px;">
                Si vous ne pouvez finalement pas y assister, pensez à annuler votre inscription
                depuis l'application afin de libérer la place.
              </p>

              <p style="margin:0;color:#aaa;font-size:12px;text-align:center;">
                Vous recevez cet e-mail car vous êtes inscrit sur MoodMap.<br/>
                © ${new Date().getFullYear()} MoodMap — paris-sorties.fr
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Send via Resend
  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MoodMap <noreply@paris-sorties.fr>",
        to: [userEmail],
        subject: `Inscription confirmée — ${activity.title}`,
        html: htmlBody,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      return new Response(JSON.stringify({ error: `Resend error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Email send failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
