import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
  hp?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/contact", async (req: Request, res: Response) => {
  const { name, email, message, hp }: ContactBody = req.body;

  if (hp && hp.length > 0) {
    res.json({ success: true });
    return;
  }

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ success: false, error: "Name is required (minimum 2 characters)" });
    return;
  }

  if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
    res.status(400).json({ success: false, error: "A valid email address is required" });
    return;
  }

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    res.status(400).json({ success: false, error: "Message is required (minimum 10 characters)" });
    return;
  }

  const sanitized = {
    name: name.trim().slice(0, 100),
    email: email.trim().slice(0, 200),
    message: message.trim().slice(0, 2000),
  };

  const resendKey = process.env["RESEND_API_KEY"];

  if (resendKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
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

      if (!response.ok) {
        req.log.error({ status: response.status }, "Resend API error");
        res.status(500).json({ success: false, error: "Failed to send email. Please try again." });
        return;
      }

      req.log.info({ name: sanitized.name, email: sanitized.email }, "Contact email sent via Resend");
    } catch (err) {
      req.log.error({ err }, "Failed to send via Resend");
      res.status(500).json({ success: false, error: "Failed to send email. Please try again." });
      return;
    }
  } else {
    req.log.info(
      { name: sanitized.name, email: sanitized.email, message: sanitized.message },
      "Contact form submission (no RESEND_API_KEY set — logging only)"
    );
  }

  res.json({ success: true, message: "Thank you! I'll get back to you soon." });
});

export default router;
