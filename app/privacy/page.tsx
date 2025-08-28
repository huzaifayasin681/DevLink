import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container max-w-4xl py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                We collect information you provide directly to us, such as when you create an account,
                update your profile, or contact us for support.
              </p>
              <ul>
                <li>Account information (name, email, username)</li>
                <li>Profile information (bio, skills, location, social links)</li>
                <li>Content you create (projects, blog posts)</li>
                <li>Usage data and analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Create and manage your developer profile</li>
                <li>Enable discovery by other developers</li>
                <li>Send important updates about our service</li>
                <li>Improve our platform and user experience</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties
                except as described in this policy:
              </p>
              <ul>
                <li>Public profile information is visible to all users</li>
                <li>We may share data with service providers who assist us</li>
                <li>We may disclose information if required by law</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                We implement appropriate security measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>You have the right to:</p>
              <ul>
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Control the visibility of your profile information</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:privacy@devlink.com" className="text-blue-600 hover:underline">
                  privacy@devlink.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}