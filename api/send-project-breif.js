import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function clean(value, maxLength = 1000) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed." },
        {
          status: 405,
          headers: {
            Allow: "POST"
          }
        }
      );
    }

    try {
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing.");

        return Response.json(
          { error: "Email service is not configured." },
          { status: 500 }
        );
      }

      const body = await request.json();

      const name = clean(body.name, 100);
      const company = clean(body.company, 150);
      const email = clean(body.email, 254);
      const phone = clean(body.phone, 50);
      const description = clean(body.description, 5000);
      const budget = clean(body.budget, 100);
      const timeline = clean(body.timeline, 100);

      if (!name || !email || !description) {
        return Response.json(
          {
            error: "Name, email, and project description are required."
          },
          { status: 400 }
        );
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        return Response.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }

      const { data, error } = await resend.emails.send({
        from:
          "Dark Sentinel Website <website@darksentineltechnologies.com>",

        to: ["montalbano@darksentineltechnologies.com"],

        replyTo: email,

        subject: `New project brief from ${name}`,

        html: `
          <h2>New Project Brief</h2>

          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Company:</strong> ${
            escapeHtml(company) || "Not provided"
          }</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${
            escapeHtml(phone) || "Not provided"
          }</p>
          <p><strong>Budget:</strong> ${
            escapeHtml(budget) || "Not provided"
          }</p>
          <p><strong>Timeline:</strong> ${
            escapeHtml(timeline) || "Not provided"
          }</p>

          <h3>Project Description</h3>
          <p>${escapeHtml(description).replaceAll("\n", "<br>")}</p>
        `
      });

      if (error) {
        console.error("Resend error:", error);

        return Response.json(
          {
            error:
              error.message || "The email service could not send the message."
          },
          { status: 500 }
        );
      }

      return Response.json(
        {
          success: true,
          messageId: data?.id
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Contact API error:", error);

      return Response.json(
        {
          error: "The server could not process the submission."
        },
        { status: 500 }
      );
    }
  }
};
