'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function PatientsList() {
  const router = useRouter()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPatients() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })

      setPatients(data || [])
      setLoading(false)
    }
    loadPatients()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading patients...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">🏥 My Patients</h1>
        <div className="flex gap-3">
          <button onClick={() => router.push('/doctor/patients/add')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            ➕ Add Patient
          </button>
          <button onClick={() => router.push('/doctor/dashboard')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {patients.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-4xl mb-4">👥</p>
            <p className="text-xl font-semibold text-gray-700">No patients yet</p>
            <p className="text-gray-400 mt-2 mb-6">Add your first patient to get started</p>
            <button onClick={() => router.push('/doctor/patients/add')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              ➕ Add First Patient
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500">#</th>
                  <th className="text-left px-6 py-3 text-gray-500">Name</th>
                  <th className="text-left px-6 py-3 text-gray-500">Age</th>
                  <th className="text-left px-6 py3 text-gray-500">Gender</th>
                  <th className="text-left px-6 py-3 text-gray-500">Contact</th>
                  <th className="text-left px-6 py-3 text-gray-500">Added On</th>
                  <th className="text-left px-6 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, index) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {patient.full_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{patient.age}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.gender === 'Male'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-pink-100 text-pink-700'
                      }`}>
                        {patient.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {patient.contact || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/predict/diabetes`)}
                        className="text-blue-600 hover:underline text-xs mr-3">
                        Predict
                      </button>
                      <button
                        onClick={() => router.push(`/doctor/prescriptions`)}
                        className="text-purple-600 hover:underline text-xs">
                        Prescribe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}