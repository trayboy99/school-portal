import ManualDatabaseSetup from "../../components/manual-database-setup"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Setup</h1>
          <p className="text-gray-600">Set up your school portal database tables in Supabase</p>
        </div>

        <ManualDatabaseSetup />
      </div>
    </div>
  )
}
