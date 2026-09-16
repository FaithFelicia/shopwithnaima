import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

serve(async (req) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const {
      orderNumber,
      customerName,
      customerEmail,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      county,
      paymentMethod,
    } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    // Build items HTML rows
    const itemsHtml = items
      .map(
        (item: { name: string; size: string; color: string; quantity: number; price: number }) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0ebe6; font-size: 14px; color: #3d2c1e;">
            ${item.name}
            ${item.size || item.color ? `<br/><span style="font-size: 12px; color: #9c7c5e;">${[item.size, item.color].filter(Boolean).join(" · ")}</span>` : ""}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0ebe6; text-align: center; font-size: 14px; color: #3d2c1e;">${item.quantity}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0ebe6; text-align: right; font-size: 14px; color: #3d2c1e; font-weight: 600;">KES ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    const paymentLabel =
      paymentMethod === "mpesa" ?"M-Pesa"
        : paymentMethod === "card" ?"Card" :"Cash on Delivery";

    const trackingUrl = `https://shopwithnaima.com/orders?ref=${orderNumber}`;

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmation – ${orderNumber}</title>
</head>
<body style="margin:0; padding:0; background-color:#faf7f4; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf7f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border: 1px solid #e8ddd5;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a0f0a; padding: 32px 40px; text-align: center;">
              <p style="margin:0; font-size: 22px; font-weight: bold; color: #f5ede4; letter-spacing: 3px; text-transform: uppercase;">Shop With Naima</p>
              <p style="margin: 6px 0 0; font-size: 12px; color: #c9a882; letter-spacing: 1px;">shopwithnaima.com</p>
            </td>
          </tr>

          <!-- Hero message -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #f0ebe6;">
              <p style="margin: 0 0 8px; font-size: 28px; color: #1a0f0a; font-weight: bold;">Thank you, ${customerName}!</p>
              <p style="margin: 0; font-size: 15px; color: #7a5c44; line-height: 1.6;">Your order has been confirmed and is being prepared with care.</p>
            </td>
          </tr>

          <!-- Order number + payment -->
          <tr>
            <td style="padding: 24px 40px; background: #fdf9f6; border-bottom: 1px solid #f0ebe6;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:50%;">
                    <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9c7c5e;">Order Number</p>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1a0f0a;">#${orderNumber}</p>
                  </td>
                  <td style="width:50%; text-align: right;">
                    <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9c7c5e;">Payment</p>
                    <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1a0f0a;">${paymentLabel}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order items -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <p style="margin: 0 0 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9c7c5e; font-family: Arial, sans-serif;">Order Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="text-align:left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9c7c5e; padding-bottom: 8px; font-family: Arial, sans-serif; font-weight: 600; border-bottom: 2px solid #e8ddd5;">Item</th>
                    <th style="text-align:center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9c7c5e; padding-bottom: 8px; font-family: Arial, sans-serif; font-weight: 600; border-bottom: 2px solid #e8ddd5;">Qty</th>
                    <th style="text-align:right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9c7c5e; padding-bottom: 8px; font-family: Arial, sans-serif; font-weight: 600; border-bottom: 2px solid #e8ddd5;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 16px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #7a5c44;">Subtotal</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #3d2c1e; text-align: right;">KES ${subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #7a5c44;">Delivery</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #3d2c1e; text-align: right;">${deliveryFee === 0 ? "FREE" : `KES ${deliveryFee.toLocaleString()}`}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0; font-size: 16px; font-weight: bold; color: #1a0f0a; border-top: 2px solid #1a0f0a;">Total Paid</td>
                  <td style="padding: 12px 0 0; font-size: 16px; font-weight: bold; color: #1a0f0a; text-align: right; border-top: 2px solid #1a0f0a;">KES ${total.toLocaleString()}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery info -->
          <tr>
            <td style="padding: 24px 40px; background: #fdf9f6; border-top: 1px solid #f0ebe6; border-bottom: 1px solid #f0ebe6;">
              <p style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9c7c5e; font-family: Arial, sans-serif;">Delivering To</p>
              <p style="margin: 0; font-size: 14px; color: #3d2c1e; line-height: 1.7;">${customerName}<br/>${deliveryAddress}<br/>${county}</p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #7a5c44;">Estimated delivery: <strong>1–3 business days</strong></p>
            </td>
          </tr>

          <!-- Track order CTA -->
          <tr>
            <td style="padding: 36px 40px; text-align: center;">
              <p style="margin: 0 0 20px; font-size: 14px; color: #7a5c44; line-height: 1.6;">We'll notify you when your order is on its way. You can also track your order status below.</p>
              <a href="${trackingUrl}" style="display: inline-block; background-color: #1a0f0a; color: #f5ede4; text-decoration: none; padding: 14px 36px; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600;">Track My Order</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#1a0f0a; padding: 28px 40px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #c9a882;">Questions? Reply to this email or contact us at</p>
              <a href="mailto:hello@shopwithnaima.com" style="color: #f5ede4; font-size: 13px; text-decoration: none;">hello@shopwithnaima.com</a>
              <p style="margin: 16px 0 0; font-size: 11px; color: #7a5c44; letter-spacing: 1px;">© 2026 Shop With Naima · Nairobi, Kenya</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [customerEmail],
        subject: `Order Confirmed – #${orderNumber} | Shop With Naima`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      throw new Error(resendData.message || "Failed to send email via Resend");
    }

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("[send-order-confirmation] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
