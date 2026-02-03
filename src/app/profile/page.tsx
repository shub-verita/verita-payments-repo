import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/db"
import { User, Mail, Globe, Clock, ExternalLink, DollarSign, Briefcase, AlertCircle, CheckCircle } from "lucide-react"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default async function ProfilePage() {
  const user = await currentUser()
  const userEmail = user?.emailAddresses?.[0]?.emailAddress

  // Find contractor by email
  const contractor = userEmail
    ? await prisma.contractor.findUnique({
        where: { email: userEmail },
        include: {
          projectAssignments: {
            where: { isActive: true },
            include: { project: true }
          }
        }
      })
    : null

  // If no contractor found, show message
  if (!contractor) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Account Setup Required</h3>
                <p className="text-yellow-700 mt-2">
                  Your account ({userEmail || "unknown"}) is not yet linked to a contractor profile.
                </p>
                <p className="text-yellow-700 mt-2">
                  Please contact the operations team to complete your account setup.
                </p>
                <a href="mailto:ops@verita.ai" className="inline-block mt-4">
                  <Button variant="outline">Contact Operations</Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeProjects = contractor.projectAssignments.map(a => a.project.name)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 mt-1">
            View your account information
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={`${contractor.firstName} ${contractor.lastName}`}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-blue-600" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Name
                  </label>
                  <p className="text-gray-900 font-medium">
                    {contractor.firstName} {contractor.lastName}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="text-gray-900">{contractor.email}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Country
                  </label>
                  <p className="text-gray-900">{contractor.country}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timezone
                  </label>
                  <p className="text-gray-900">{contractor.timezone || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compensation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Compensation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Hourly Rate
              </label>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(Number(contractor.hourlyRate))}/hr
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Weekly Cap
              </label>
              <p className="text-xl font-semibold text-gray-900">
                {contractor.weeklyCap ? `${contractor.weeklyCap} hrs` : "No cap"}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                Currency
              </label>
              <p className="text-xl font-semibold text-gray-900">
                {contractor.currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Account Status</span>
              <Badge variant={contractor.status === "ACTIVE" ? "success" : "warning"}>
                {contractor.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Background Check</span>
              <Badge
                variant={contractor.checkrStatus === "CLEAR" ? "success" : contractor.checkrStatus === "PENDING" ? "warning" : "secondary"}
                className="gap-1"
              >
                {contractor.checkrStatus === "CLEAR" && <CheckCircle className="h-3 w-3" />}
                {contractor.checkrStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Payment Eligible</span>
              <Badge variant={contractor.paymentEligible ? "success" : "destructive"}>
                {contractor.paymentEligible ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Onboarding</span>
              <Badge variant={contractor.onboardingComplete ? "success" : "warning"}>
                {contractor.onboardingComplete ? "Complete" : "In Progress"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Card */}
      {activeProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeProjects.map((project, index) => (
                <Badge key={index} variant="info" className="gap-1">
                  <Briefcase className="h-3 w-3" />
                  {project}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Support Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            If you have questions about your payments, documents, or account, our support team is here to help.
          </p>
          <a
            href="mailto:support@verita.ai"
            className="inline-flex"
          >
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Contact Support
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
