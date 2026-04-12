'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function PatientDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      if (profile?.role !== 'patient') {
        router.push('/doctor/dashboard'); return
      }

      setProfile(profile)

      // ✅ Fixed: use limit(1) instead of single() to avoid 406 error
      const { data: patients } = await supabase
        .from('patients')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const patient = patients?.[0] || null

      if (patient) {
        const { data: preds } = await supabase
          .from('predictions')
          .select('*')
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
        setPredictions(preds || [])

        const { data: prescs } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
        setPrescriptions(prescs || [])
      }

      setLoading(false)
    }
    loadData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">🏥 Patient Portal</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => document.getElementById('predictions-section').scrollIntoView({behavior:'smooth'})}
            className="text-gray-600 hover:text-blue-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition">
            🔬 My Predictions
          </button>
          <button onClick={() => document.getElementById('prescriptions-section').scrollIntoView({behavior:'smooth'})}
            className="text-gray-600 hover:text-purple-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-purple-50 transition">
            💊 Prescriptions
          </button>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600 text-sm">🧑 {profile?.full_name}</span>
          <button onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome, {profile?.full_name}! 👋
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'My Predictions', value: predictions.length, icon: '🔬', color: 'bg-blue-50 text-blue-600' },
            { label: 'Prescriptions', value: prescriptions.length, icon: '💊', color: 'bg-purple-50 text-purple-600' },
            { label: 'Reports', value: predictions.length, icon: '📋', color: 'bg-green-50 text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-5`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm mt-1 opacity-75">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* My Predictions */}
        <div id="predictions-section" className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔬 My Predictions</h3>
          {predictions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🔬</p>
              <p className="text-gray-400">No predictions yet</p>
              <p className="text-gray-400 text-sm mt-1">Your doctor will run predictions for you</p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((pred) => (
                <div key={pred.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 transition">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pred.disease_type === 'diabetes' ? 'bg-blue-100 text-blue-700' :
                      pred.disease_type === 'heart' ? 'bg-red-100 text-red-700' :
                      pred.disease_type === 'general' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {pred.disease_type}
                    </span>
                    <span className="text-gray-700 font-medium">{pred.result}</span>
                  </div>
                  <div className="text-right">
                    {pred.confidence > 0 && (
                      <p className="text-sm font-medium text-gray-600">{pred.confidence}%</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(pred.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Prescriptions */}
        <div id="prescriptions-section" className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💊 My Prescriptions</h3>
          {prescriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">💊</p>
              <p className="text-gray-400">No prescriptions yet</p>
              <p className="text-gray-400 text-sm mt-1">Your doctor will add prescriptions here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((presc) => (
                <div key={presc.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-purple-200 transition">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-purple-600">💊 Prescription</span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      {new Date(presc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg whitespace-pre-line">
                    {presc.prescription_text}
                  </p>
                  {presc.notes && (
                    <p className="text-sm text-gray-500 mt-3 italic flex gap-2">
                      <span>📝</span>
                      <span>{presc.notes}</span>
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