import SettingsForm from "@/components/SettingsForm"

export default function SettingsPage() {
  const initialValues = {
    payoutMethod: 'bank',
    bankName: 'First Bank',
    accountNumber: '1234567890',
    accountName: 'John Doe',
    email: 'john@example.com',
    notificationEnabled: true
  }

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Settings</h2>
        </div>
      </header>

      <main className="p-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-6">Account Settings</h3>
          <SettingsForm initialValues={initialValues} />
        </div>
      </main>
    </>
  )
}