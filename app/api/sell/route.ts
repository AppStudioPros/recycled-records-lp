import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, message, files } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const fileList = files?.length
      ? files.map((f: { name: string; url: string; type: string }) =>
          `<li><a href="${f.url}">${f.name}</a> (${f.type})</li>`
        ).join('')
      : null

    await resend.emails.send({
      from: 'Recycled Records LP <noreply@mail.recycledrecordslps.com>',
      to: ['gale@recycledrecordslps.com'],
      replyTo: email,
      subject: `New Sell Inquiry from ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1008;">
          <div style="background: #1a1008; padding: 24px 32px;">
            <h1 style="color: #F2EBDD; font-size: 1.4rem; margin: 0; letter-spacing: 0.04em;">RECYCLED RECORDS LP</h1>
            <p style="color: #C4522A; font-size: 0.75rem; margin: 4px 0 0; letter-spacing: 0.1em; text-transform: uppercase;">New Sell Inquiry</p>
          </div>
          <div style="padding: 32px; background: #FAF7F0; border: 1px solid rgba(26,16,8,0.1);">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid rgba(26,16,8,0.1); font-weight: 700; width: 120px;">Name</td><td style="padding: 8px 0; border-bottom: 1px solid rgba(26,16,8,0.1);">${name}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid rgba(26,16,8,0.1); font-weight: 700;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid rgba(26,16,8,0.1);"><a href="mailto:${email}" style="color: #C4522A;">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid rgba(26,16,8,0.1); font-weight: 700;">Phone</td><td style="padding: 8px 0; border-bottom: 1px solid rgba(26,16,8,0.1);">${phone}</td></tr>` : ''}
            </table>
            <h2 style="font-size: 1rem; margin: 0 0 12px; letter-spacing: 0.04em; text-transform: uppercase;">Product Details</h2>
            <p style="background: #fff; border: 1px solid rgba(26,16,8,0.15); padding: 16px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
            ${fileList ? `
            <h2 style="font-size: 1rem; margin: 24px 0 12px; letter-spacing: 0.04em; text-transform: uppercase;">Uploaded Files</h2>
            <ul style="padding-left: 20px; line-height: 2;">${fileList}</ul>
            ` : ''}
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(26,16,8,0.1); font-size: 0.8rem; color: #888;">
              Reply directly to this email to respond to ${name}.<br />
              Submitted via recycledrecordslps.com/sell
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Sell form error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
