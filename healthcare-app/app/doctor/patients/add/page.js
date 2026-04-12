'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AddPatient() {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '', age: '', gender: 'Male', contact: '', medical_history: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('patients').insert({
      full_name: form.full_name,
      age: parseInt(form.age),
      gender: form.gender,
      contact: form.contact,
      medical_history: form.medical_history,
      doctor_id: user.id
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/doctor/dashboard'), 1500)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <button onClick={() => router.back()}
            className="text-blue-600 hover:underline text-sm mb-4 block">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-blue-600">➕ Add New Patient</h1>
          <p className="text-gray-500 text-sm mt-1">Register a new patient record</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          {success ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-4">✅</p>
              <p className="text-xl font-bold text-green-600">Patient added successfully!</p>
              <p className="text-gray-500 text-sm mt-2">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="full_name" value={form.full_name}
                  onChange={handleChange} required
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. John Doe" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input type="number" name="age" value={form.age}
                    onChange={handleChange} required
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 35" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input type="text" name="contact" value={form.contact}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. +91 9876543210" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Medical History</label>
                <textarea name="medical_history" value={form.medical_history}
                  onChange={handleChange} rows={3}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any existing conditions, allergies, medications..." />
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? 'Adding Patient...' : '➕ Add Patient'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}