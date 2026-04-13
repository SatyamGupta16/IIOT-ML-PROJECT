'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const SAMPLE_DATA = {
  age: '50', gender: '1', chest_pain_type: '2',
  blood_pressure: '120', cholesterol: '180', max_heart_rate: '160',
  exercise_angina: '0', plasma_glucose: '95', skin_thickness: '55',
  insulin: '110', bmi: '27', diabetes_pedigree: '0.47',
  hypertension: '0', heart_disease: '0',
  Residence_type: 'Urban', smoking_status: 'never smoked'
}

export default function ClusteringPredict() {
  const router = useRouter()
  const [form, setForm] = useState({
    age: '', gender: '1', chest_pain_type: '2',
    blood_pressure: '', cholesterol: '', max_heart_rate: '',
    exercise_angina: '0', plasma_glucose: '', skin_thickness: '',
    insulin: '', bmi: '', diabetes_pedigree: '',
    hypertension: '0', heart_disease: '0',
    Residence_type: 'Urban', smoking_status: 'never smoked'
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict/clustering`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseFloat(form.age),
          blood_pressure: parseFloat(form.blood_pressure),
          cholesterol: parseFloat(form.cholesterol),
          max_heart_rate: parseFloat(form.max_heart_rate),
          plasma_glucose: parseFloat(form.plasma_glucose),
          skin_thickness: parseFloat(form.skin_thickness),
          insulin: parseFloat(form.insulin),
          bmi: parseFloat(form.bmi),
          diabetes_pedigree: parseFloat(form.diabetes_pedigree)
        })
      })

      const data = await response.json()
      setResult(data)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: patients } = await supabase
          .from('patients').select('id')
          .eq('doctor_id', user.id)
          .order('created_at', { ascending: false }).limit(1)
        const patient = patients?.[0]
        if (patient) {
          await supabase.from('predictions').insert({
            patient_id: patient.id,
            disease_type: 'clustering',
            input_data: form,
            result: data.result,
            confidence: 0
          })
        }
      }
    } catch (err) {
      setError('Failed to connect to ML server. Make sure FastAPI is running.')
    }
    setLoading(false)
  }

  const inputClass = "mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
  const labelClass = "block text-sm font-medium text-gray-700"

  const triageColors = {
    'yellow': 'bg-yellow-50 border-yellow-400 text-yellow-700',
    'orange': 'bg-orange-50 border-orange-400 text-orange-700',
    'red': 'bg-red-50 border-red-400 text-red-700',
    'green': 'bg-green-50 border-green-400 text-green-700',
    'black': 'bg-gray-900 border-gray-700 text-white',
  }
  const triageLevel = result?.triage?.toLowerCase()
  const colorClass = triageColors[triageLevel] || 'bg-blue-50 border-blue-400 text-blue-700'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <button onClick={() => router.back()}
            className="text-purple-600 hover:underline text-sm mb-4 block">
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-purple-600">👥 Patient Clustering</h1>
              <p className="text-gray-500 text-sm mt-1">Predict patient triage priority level</p>
            </div>
            <button onClick={() => setForm(SAMPLE_DATA)}
              className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition border border-purple-200">
              🧪 Use Sample Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Age</label>
                <input type="number" name="age" value={form.age}
                  onChange={handleChange} required placeholder="e.g. 50" className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                  <option value="1">Male (1)</option>
                  <option value="0">Female (0)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Chest Pain Type</label>
                <select name="chest_pain_type" value={form.chest_pain_type} onChange={handleChange} className={inputClass}>
                  <option value="1">Type 1</option>
                  <option value="2">Type 2</option>
                  <option value="3">Type 3</option>
                  <option value="4">Type 4</option>
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Blood Pressure</label>
                <input type="number" name="blood_pressure" value={form.blood_pressure}
                  onChange={handleChange} required placeholder="e.g. 120" className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Cholesterol</label>
                <input type="number" name="cholesterol" value={form.cholesterol}
                  onChange={handleChange} required placeholder="e.g. 180" className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Max Heart Rate</label>
                <input type="number" name="max_heart_rate" value={form.max_heart_rate}
                  onChange={handleChange} required placeholder="e.g. 160" className={inputClass}/>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Exercise Angina</label>
                <select name="exercise_angina" value={form.exercise_angina} onChange={handleChange} className={inputClass}>
                  <option value="0">No (0)</option>
                  <option value="1">Yes (1)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Plasma Glucose</label>
                <input type="number" name="plasma_glucose" value={form.plasma_glucose}
                  onChange={handleChange} required placeholder="e.g. 95" className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Skin Thickness</label>
                <input type="number" name="skin_thickness" value={form.skin_thickness}
                  onChange={handleChange} required placeholder="e.g. 55" className={inputClass}/>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Insulin</label>
                <input type="number" name="insulin" value={form.insulin}
                  onChange={handleChange} required placeholder="e.g. 110" className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>BMI</label>
                <input type="number" step="0.01" name="bmi" value={form.bmi}
                  onChange={handleChange} required placeholder="e.g. 27" className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Diabetes Pedigree</label>
                <input type="number" step="0.01" name="diabetes_pedigree" value={form.diabetes_pedigree}
                  onChange={handleChange} required placeholder="e.g. 0.47" className={inputClass}/>
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Hypertension</label>
                <select name="hypertension" value={form.hypertension} onChange={handleChange} className={inputClass}>
                  <option value="0">No (0)</option>
                  <option value="1">Yes (1)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Heart Disease</label>
                <select name="heart_disease" value={form.heart_disease} onChange={handleChange} className={inputClass}>
                  <option value="0">No (0)</option>
                  <option value="1">Yes (1)</option>
                </select>
              </div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Residence Type</label>
                <select name="Residence_type" value={form.Residence_type} onChange={handleChange} className={inputClass}>
                  <option>Urban</option>
                  <option>Rural</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Smoking Status</label>
                <select name="smoking_status" value={form.smoking_status} onChange={handleChange} className={inputClass}>
                  {['never smoked','formerly smoked','smokes','Unknown'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50">
              {loading ? '🔄 Analyzing...' : '👥 Predict Triage Level'}
            </button>
          </form>
        </div>

        {result && (
          <div className={`mt-6 rounded-xl shadow p-6 border-l-4 ${colorClass}`}>
            <h2 className="text-xl font-bold mb-2">Triage Result</h2>
            <p className="text-2xl font-bold">🏥 {result.result}</p>
            <div className="mt-3 text-sm">
              <p><span className="font-semibold">Level:</span> {result.triage?.toUpperCase()}</p>
              <p className="mt-2 opacity-75">
                {triageLevel === 'red' && '🚨 Immediate attention required'}
                {triageLevel === 'orange' && '⚠️ Urgent — seen within 10 minutes'}
                {triageLevel === 'yellow' && '🟡 Semi-urgent — seen within 30 minutes'}
                {triageLevel === 'green' && '✅ Non-urgent — routine care'}
                {triageLevel === 'black' && '⬛ Critical — expectant'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}