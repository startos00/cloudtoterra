import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

// Issues short-lived client upload tokens so the browser can upload property
// photos directly to Vercel Blob (no server bandwidth). Requires BLOB_READ_WRITE_TOKEN
// (set automatically when a Blob store is linked to the Vercel project). When the
// token is absent (e.g. local dev), this 400s and the client falls back to inline
// base64 storage — see SubmissionModal.
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'blob_not_configured' }, { status: 400 })
  }
  try {
    const body = (await request.json()) as HandleUploadBody
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maximumSizeInBytes: 8 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // Public URL is returned to the client by upload(); nothing to persist here.
      },
    })
    return NextResponse.json(json)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
