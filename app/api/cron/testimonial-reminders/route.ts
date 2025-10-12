import { NextRequest, NextResponse } from "next/server"
import { sendTestimonialReminders } from "@/lib/scheduled-jobs"

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

    console.log('Testimonial reminders cron job triggered')
    const result = await sendTestimonialReminders()

    return NextResponse.json({
      message: 'Testimonial reminders sent successfully',
      ...result
    })
  } catch (error) {
    console.error('Testimonial reminders cron job failed:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
