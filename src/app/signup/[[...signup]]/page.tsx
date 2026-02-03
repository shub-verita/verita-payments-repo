import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 text-white font-bold text-xl mb-4">
            V
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verita Payments</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
            }
          }}
        />
      </div>
    </div>
  )
}
