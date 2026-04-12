'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Prescriptions() {
  const router = useRouter()
  const [patients, setPatients] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    patient_id: '',
    prescription_text: '',
    notes: ''
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Load doctor's patients
      const { data: patientsData } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })

      setPatients(patientsData || [])

      // Load all prescriptions by this doctor
      const { data: prescData } = await supabase
        .from('prescriptions')
        .select('*, patients(full_name)')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })

      setPrescriptions(prescData || [])
      setLoading(false)
    }
    loadData()
  }, [success])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('prescriptions').insert({
      patient_id: form.patient_id,
      doctor_id: user.id,
      prescription_text: form.prescription_text,
      notes: form.notes
    })

    if (!error) {
      setSuccess(true)
      setForm({ patient_id: '', prescription_text: '', notes: '' })
      setTimeout(() => setSuccess(false), 3000)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-600">💊 Prescriptions</h1>
        <button onClick={() => router.push('/doctor/dashboard')}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Write Prescription Form */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ✍️ Write New Prescription
          </h2>

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
              ✅ Prescription saved successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select Patient */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Patient
              </label>
              <select
                value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                required
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Choose a patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} (Age: {p.age})
                  </option>
                ))}
              </select>
            </div>

            {/* Prescription */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prescription / Medications
              </label>
              <textarea
                value={form.prescription_text}
                onChange={(e) => setForm({ ...form, prescription_text: e.target.value })}
                required rows={4}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Metformin 500mg - twice daily after meals&#10;Aspirin 75mg - once daily"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Doctor's Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Additional advice, follow-up instructions..."
              />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50">
              {submitting ? 'Saving...' : '💊 Save Prescription'}
            </button>
          </form>
        </div>

        {/* Past Prescriptions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Past Prescriptions
          </h2>

          {prescriptions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No prescriptions written yet
            </p>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((presc) => (
                <div key={presc.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-800">
                      👤 {presc.patients?.full_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(presc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg whitespace-pre-line">
                    💊 {presc.prescription_text}
                  </p>
                  {presc.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      📝 {presc.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}