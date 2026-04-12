'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

export default function DoctorDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPredictions: 0,
    totalPrescriptions: 0,
    todayActivity: 0
  })
  const [predictionsByType, setPredictionsByType] = useState([])
  const [recentPredictions, setRecentPredictions] = useState([])
  const [predictionsTrend, setPredictionsTrend] = useState([])

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      if (profile?.role !== 'doctor') { router.push('/patient/dashboard'); return }

      setProfile(profile)

      const { data: patients } = await supabase
        .from('patients').select('id').eq('doctor_id', user.id)
      const patientIds = patients?.map(p => p.id) || []

      let predictions = []
      if (patientIds.length > 0) {
        const { data } = await supabase
          .from('predictions').select('*')
          .in('patient_id', patientIds)
          .order('created_at', { ascending: false })
        predictions = data || []
      }

      const { data: prescriptions } = await supabase
        .from('prescriptions').select('id').eq('doctor_id', user.id)

      const today = new Date().toISOString().split('T')[0]
      const todayPreds = predictions.filter(p => p.created_at?.startsWith(today))

      setStats({
        totalPatients: patientIds.length,
        totalPredictions: predictions.length,
        totalPrescriptions: prescriptions?.length || 0,
        todayActivity: todayPreds.length
      })

      const typeCount = { general: 0, diabetes: 0, heart: 0, clustering: 0 }
      predictions.forEach(p => {
        if (typeCount[p.disease_type] !== undefined)
          typeCount[p.disease_type]++
      })
      setPredictionsByType([
        { name: 'Disease', value: typeCount.general, color: '#22c55e' },
        { name: 'Diabetes', value: typeCount.diabetes, color: '#3b82f6' },
        { name: 'Heart', value: typeCount.heart, color: '#ef4444' },
        { name: 'Clustering', value: typeCount.clustering, color: '#a855f7' },
      ])

      setRecentPredictions(predictions.slice(0, 5))

      const trend = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const count = predictions.filter(p => p.created_at?.startsWith(dateStr)).length
        trend.push({
          date: date.toLocaleDateString('en', { weekday: 'short' }),
          count
        })
      }
      setPredictionsTrend(trend)
      setLoading(false)
    }

    loadDashboard()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ✅ Updated Navbar with navigation links */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">🏥 Doctor Dashboard</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/doctor/patients')}
            className="text-gray-600 hover:text-blue-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition">
            👥 Patients
          </button>
          <button onClick={() => router.push('/doctor/prescriptions')}
            className="text-gray-600 hover:text-purple-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-purple-50 transition">
            💊 Prescriptions
          </button>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600 text-sm">👨‍⚕️ {profile?.full_name}</span>
          <button onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Welcome, {profile?.full_name}! 👋
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Patients', value: stats.totalPatients, icon: '👥', bg: 'bg-blue-50', text: 'text-blue-600' },
            { label: 'Predictions Made', value: stats.totalPredictions, icon: '🔬', bg: 'bg-green-50', text: 'text-green-600' },
            { label: 'Prescriptions', value: stats.totalPrescriptions, icon: '💊', bg: 'bg-purple-50', text: 'text-purple-600' },
            { label: "Today's Activity", value: stats.todayActivity, icon: '📊', bg: 'bg-orange-50', text: 'text-orange-600' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-5`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-3xl font-bold ${stat.text}`}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📈 Predictions This Week
            </h3>
            {predictionsTrend.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={predictionsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                No predictions this week yet
              </div>
            )}
          </div>

          {/* Fixed Pie Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🍩 Predictions by Type
            </h3>
            {predictionsByType.some(d => d.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={predictionsByType.filter(d => d.value > 0)}
                      cx="50%" cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      dataKey="value"
                      label={false}
                    >
                      {predictionsByType.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} predictions`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {predictionsByType.filter(d => d.value > 0).map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: d.color }}/>
                      <span className="text-sm text-gray-600">
                        {d.name}: <strong>{d.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                No predictions yet
              </div>
            )}
          </div>
        </div>

        {/* ✅ Updated Quick Actions — 7 buttons including Patients + Prescriptions */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Add Patient', icon: '➕', href: '/doctor/patients/add' },
              { label: 'My Patients', icon: '🧑‍🤝‍🧑', href: '/doctor/patients' },
              { label: 'Prescriptions', icon: '💊', href: '/doctor/prescriptions' },
              { label: 'Disease Prediction', icon: '🦠', href: '/predict/disease' },
              { label: 'Diabetes Check', icon: '🩺', href: '/predict/diabetes' },
              { label: 'Heart Disease', icon: '❤️', href: '/predict/heart' },
              { label: 'Patient Clustering', icon: '👥', href: '/predict/clustering' },
            ].map((action) => (
              <button key={action.label}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center p-4 border-2 border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition">
                <span className="text-2xl mb-2">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Predictions Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🕐 Recent Predictions
          </h3>
          {recentPredictions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-500">Type</th>
                    <th className="text-left py-2 text-gray-500">Result</th>
                    <th className="text-left py-2 text-gray-500">Confidence</th>
                    <th className="text-left py-2 text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPredictions.map((pred) => (
                    <tr key={pred.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pred.disease_type === 'diabetes' ? 'bg-blue-100 text-blue-700' :
                          pred.disease_type === 'heart' ? 'bg-red-100 text-red-700' :
                          pred.disease_type === 'general' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {pred.disease_type}
                        </span>
                      </td>
                      <td className="py-2 text-gray-700">{pred.result}</td>
                      <td className="py-2 text-gray-500">
                        {pred.confidence ? `${pred.confidence}%` : '—'}
                      </td>
                      <td className="py-2 text-gray-400">
                        {new Date(pred.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No predictions yet. Use Quick Actions to make predictions!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}