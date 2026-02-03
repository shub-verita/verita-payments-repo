import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/db"

const documentTypeLabels: Record<string, { title: string; description: string }> = {
  NDA: {
    title: "Non-Disclosure Agreement",
    description: "Confidentiality agreement for project work"
  },
  CIIAA: {
    title: "Confidential Information and Invention Assignment Agreement",
    description: "IP assignment and confidentiality terms"
  },
  TERMS_OF_WORK: {
    title: "Terms of Work",
    description: "Contractor engagement terms and conditions"
  },
  OFFER_LETTER: {
    title: "Offer Letter",
    description: "Formal contractor engagement offer"
  },
  W8_BEN: {
    title: "W-8BEN",
    description: "Certificate of Foreign Status"
  },
  W9: {
    title: "W-9",
    description: "Request for Taxpayer Identification Number"
  },
}

function StatusBadge({ status }: { status: string }) {
  if (status === "SIGNED") {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Signed
      </Badge>
    )
  }
  if (status === "VIEWED") {
    return (
      <Badge variant="info" className="gap-1">
        Viewed
      </Badge>
    )
  }
  if (status === "SENT") {
    return (
      <Badge variant="warning" className="gap-1">
        Sent
      </Badge>
    )
  }
  return (
    <Badge variant="warning" className="gap-1">
      <Clock className="h-3 w-3" />
      Pending
    </Badge>
  )
}

function formatDate(date: Date | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default async function DocumentsPage() {
  const user = await currentUser()
  const userEmail = user?.emailAddresses?.[0]?.emailAddress

  // Find contractor by email
  const contractor = userEmail
    ? await prisma.contractor.findUnique({
        where: { email: userEmail },
        include: {
          documents: {
            orderBy: { createdAt: "desc" }
          }
        }
      })
    : null

  // If no contractor found, show message
  if (!contractor) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        </div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Account Setup Required</h3>
                <p className="text-yellow-700 mt-2">
                  Your account is not yet linked to a contractor profile.
                  Please contact the operations team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const documents = contractor.documents.map(doc => ({
    id: doc.id,
    type: doc.type,
    title: documentTypeLabels[doc.type]?.title || doc.type,
    description: documentTypeLabels[doc.type]?.description || "",
    status: doc.status,
    signedAt: doc.signedAt,
  }))

  const signedCount = documents.filter(d => d.status === "SIGNED").length
  const pendingCount = documents.filter(d => d.status !== "SIGNED").length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">
            View and manage your contractor documents
          </p>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800">Document Signing Coming Soon</h3>
              <p className="text-sm text-blue-700 mt-1">
                Online document signing is currently in development.
                You&apos;ll soon be able to sign documents directly from this page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{documents.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Signed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{signedCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={pendingCount > 0 ? "border-yellow-200 bg-yellow-50" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${pendingCount > 0 ? "text-yellow-700" : "text-gray-500"}`}>
                  Pending Signature
                </p>
                <p className={`text-2xl font-bold mt-1 ${pendingCount > 0 ? "text-yellow-700" : "text-gray-900"}`}>
                  {pendingCount}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${pendingCount > 0 ? "bg-yellow-100" : "bg-gray-100"}`}>
                <Clock className={`h-6 w-6 ${pendingCount > 0 ? "text-yellow-600" : "text-gray-400"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No documents yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{doc.description}</p>
                      {doc.signedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Signed on {formatDate(doc.signedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
