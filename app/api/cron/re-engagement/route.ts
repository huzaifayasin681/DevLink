import { NextRequest, NextResponse } from "next/server"
import { sendReEngagementEmails } from "@/lib/scheduled-jobs"

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron request - invalid secret')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Re-engagement emails cron job triggered')
    const result = await sendReEngagementEmails()

    return NextResponse.json({
      message: 'Re-engagement emails sent successfully',
      ...result
    })
  } catch (error) {
    console.error('Re-engagement emails cron job failed:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
