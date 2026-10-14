export function inviteEmailHtml({
  displayName,
  role,
  inviteLink,
}: {
  displayName: string
  role: string
  inviteLink: string
}) {
  const roleLabelMap: Record<string, string> = {
    user: 'User',
    admin: 'Admin',
    super_admin: 'Super Admin',
  }
  const roleLabel = roleLabelMap[role] ?? role

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to the Recycled Records LP team</title>
</head>
<body style="margin:0;padding:0;background-color:#1a0a00;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a0a00;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Header -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="font-size:26px;font-weight:800;color:#C4522A;letter-spacing:-0.5px;">Recycled Records LP</div>
              <div style="font-size:13px;color:#FAF7F2;opacity:0.6;margin-top:4px;letter-spacing:0.5px;">Boulder's Premier Vinyl Shop</div>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background-color:#FAF7F2;border-radius:16px;padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1a0a00;">Hi ${displayName},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#3a2a1a;line-height:1.6;">
                You've been invited to join the <strong>Recycled Records LP</strong> team as <strong>${roleLabel}</strong>.
                Click the button below to accept your invitation and set your password.
              </p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#C4522A;border-radius:10px;">
                    <a href="${inviteLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#7a6a5a;">This link expires in 7 days.</p>
              <p style="margin:0;font-size:13px;color:#7a6a5a;">If you didn't expect this email, you can safely ignore it.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#FAF7F2;opacity:0.4;">
                Recycled Records LP · 6565 Gunpark Dr, Ste 190, Boulder, CO 80301
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function resetPasswordEmailHtml({
  displayName,
  resetLink,
}: {
  displayName: string
  resetLink: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your Recycled Records LP password</title>
</head>
<body style="margin:0;padding:0;background-color:#1a0a00;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a0a00;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Header -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="font-size:26px;font-weight:800;color:#C4522A;letter-spacing:-0.5px;">Recycled Records LP</div>
              <div style="font-size:13px;color:#FAF7F2;opacity:0.6;margin-top:4px;letter-spacing:0.5px;">Boulder's Premier Vinyl Shop</div>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background-color:#FAF7F2;border-radius:16px;padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1a0a00;">Hi ${displayName},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#3a2a1a;line-height:1.6;">
                A password reset was requested for your <strong>Recycled Records LP</strong> account.
                Click the button below to set a new password.
              </p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#C4522A;border-radius:10px;">
                    <a href="${resetLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
                      Set New Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#7a6a5a;">This link expires in 1 hour.</p>
              <p style="margin:0;font-size:13px;color:#7a6a5a;">If you didn't request a password reset, you can safely ignore this email.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#FAF7F2;opacity:0.4;">
                Recycled Records LP · 6565 Gunpark Dr, Ste 190, Boulder, CO 80301
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
