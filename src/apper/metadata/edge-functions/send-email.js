import apper from "https://cdn.apper.io/actions/apper-actions.js";
import { Resend } from "npm:resend";

apper.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed. Use POST."
      }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid JSON in request body"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const { to, subject, message } = body;

  if (!to || !subject || !message) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing required fields: to, subject, and message are required"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid email address format"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  let resendApiKey;
  try {
    resendApiKey = await apper.getSecret("RESEND_API_KEY");
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Email service configuration error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  if (!resendApiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Email service API key not configured"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const resend = new Resend(resendApiKey);

  try {
    const result = await resend.emails.send({
      from: "CRM Pro <onboarding@resend.dev>",
      to: to,
      subject: subject,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p style="white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
      </div>`
    });

    if (result.error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error.message || "Failed to send email"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.data.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send email"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});