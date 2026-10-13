import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file type from pathname extension
        const ext = pathname.split('.').pop()?.toLowerCase() ?? ''
        const allowedExts = ['jpg','jpeg','png','webp','gif','mp4','mov','webm']
        if (!allowedExts.includes(ext)) {
          throw new Error('File type not allowed')
        }
        return {
          allowedContentTypes: [
            'image/jpeg','image/png','image/webp','image/gif',
            'video/mp4','video/quicktime','video/webm',
          ],
          // No size limit set here — Vercel Blob handles up to 5TB
          tokenPayload: JSON.stringify({ uploadedAt: new Date().toISOString() }),
        }
      },
      onUploadCompleted: async ({ blob }) => {
        // File successfully uploaded — URL available at blob.url
        console.log('Upload complete:', blob.url)
      },
    })
    return NextResponse.json(jsonResponse)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}
