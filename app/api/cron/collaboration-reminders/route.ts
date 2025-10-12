import { NextRequest, NextResponse } from "next/server"
import { sendCollaborationRequestReminders } from "@/lib/scheduled-jobs"

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

    console.log('Collaboration reminders cron job triggered')
    const result = await sendCollaborationRequestReminders()

    return NextResponse.json({
      success: true,
      message: 'Collaboration reminders sent successfully',
      ...result
    })
  } catch (error) {
    console.error('Collaboration reminders cron job failed:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
