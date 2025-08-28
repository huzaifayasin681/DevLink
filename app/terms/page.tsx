import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container max-w-4xl py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                By accessing and using DevLink, you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above,
                please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Use License</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Permission is granted to temporarily use DevLink for personal, non-commercial
                transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Content</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                You retain ownership of any content you submit, post or display on or through DevLink.
                By submitting content, you grant us a worldwide, non-exclusive, royalty-free license
                to use, copy, reproduce, process, adapt, modify, publish, transmit, display and
                distribute such content.
              </p>
              <p>You are responsible for:</p>
              <ul>
                <li>Ensuring your content does not violate any laws or regulations</li>
                <li>Respecting intellectual property rights of others</li>
                <li>Not posting harmful, offensive, or inappropriate content</li>
                <li>Maintaining the accuracy of your profile information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>When creating an account, you agree to:</p>
              <ul>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>You may not use DevLink:</p>
              <ul>
                <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations or laws</li>
                <li>To transmit or procure the sending of any advertising or promotional material</li>
                <li>To impersonate or attempt to impersonate another person or entity</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                We strive to provide reliable service, but cannot guarantee 100% uptime.
                We reserve the right to modify or discontinue the service at any time
                without notice. We shall not be liable for any modification, suspension,
                or discontinuance of the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                In no event shall DevLink or its suppliers be liable for any damages
                (including, without limitation, damages for loss of data or profit, or
                due to business interruption) arising out of the use or inability to
                use DevLink, even if DevLink or its authorized representative has been
                notified orally or in writing of the possibility of such damage.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:legal@devlink.com" className="text-blue-600 hover:underline">
                  legal@devlink.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}