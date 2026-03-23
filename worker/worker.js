/**
 * Cloudflare Worker — Portfolio Contact Form API
 * Deploy with: wrangler deploy
 * Set secret: wrangler secret put RESEND_API_KEY
 */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    if (url.pathname !== "/api/contact" || request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ success: false, error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const { name, email, message, hp } = body;

    if (hp && hp.length > 0) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    if (!name || name.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Name is required (minimum 2 characters)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }

    if (!email || !isValidEmail(email.trim())) {
      return new Response(
        JSON.stringify({ success: false, error: "A valid email address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }

    if (!message || message.trim().length < 10) {
      return new Response(
        JSON.stringify({ success: false, error: "Message is required (minimum 10 characters)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }

    const sanitized = {
      name: name.trim().slice(0, 100),
      email: email.trim().slice(0, 200),
      message: message.trim().slice(0, 2000),
    };

    if (env.RESEND_API_KEY) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Portfolio Contact <onboarding@resend.dev>",
            to: ["a2nnajmul@gmail.com"],
            subject: `Portfolio Contact from ${sanitized.name}`,
            text: `Name: ${sanitized.name}\nEmail: ${sanitized.email}\n\nMessage:\n${sanitized.message}`,
            reply_to: sanitized.email,
          }),
        });

        if (!emailResponse.ok) {
          return new Response(
            JSON.stringify({ success: false, error: "Failed to send email. Please try again." }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
          );
        }
      } catch {
        return new Response(
          JSON.stringify({ success: false, error: "Failed to send email. Please try again." }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Thank you! I'll get back to you soon." }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      }
    );
  },
};
