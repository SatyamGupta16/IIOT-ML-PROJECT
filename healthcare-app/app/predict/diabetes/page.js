'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const SAMPLE_DATA = {
  gender: 'Female', age: '45', hypertension: '0',
  heart_disease: '0', smoking_history: 'never',
  bmi: '28.5', HbA1c_level: '7.2', blood_glucose_level: '180'
}

export default function DiabetesPredict() {
  const router = useRouter()
  const [form, setForm] = useState({
    gender: 'Male', age: '', hypertension: '0',
    heart_disease: '0', smoking_history: 'never',
    bmi: '', HbA1c_level: '', blood_glucose_level: ''
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
      const response = await fetch('http://localhost:8000/predict/diabetes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseFloat(form.age),
          bmi: parseFloat(form.bmi),
          HbA1c_level: parseFloat(form.HbA1c_level),
          blood_glucose_level: parseFloat(form.blood_glucose_level)
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
            disease_type: 'diabetes',
            input_data: form,
            result: data.result,
            confidence: data.confidence
          })
        }
      }
    } catch (err) {
      setError('Failed to connect to ML server. Make sure FastAPI is running.')
    }
    setLoading(false)
  }

  const inputClass = "mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-medium text-gray-700"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <button onClick={() => router.back()}
            className="text-blue-600 hover:underline text-sm mb-4 block">
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">🩺 Diabetes Prediction</h1>
              <p className="text-gray-500 text-sm mt-1">Enter patient details to predict diabetes risk</p>
            </div>
            <button
              onClick={() => setForm(SAMPLE_DATA)}
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition border border-blue-200">
              🧪 Use Sample Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Age (years)</label>
                <input type="number" name="age" value={form.age}
                  onChange={handleChange} required placeholder="e.g. 45" className={inputClass}/>
              </div>
            </div>

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

            <div>
              <label className={labelClass}>Smoking History</label>
              <select name="smoking_history" value={form.smoking_history} onChange={handleChange} className={inputClass}>
                {['never','No Info','current','former','ever','not current'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>BMI</label>
                <input type="number" step="0.01" name="bmi" value={form.bmi}
                  onChange={handleChange} required placeholder="e.g. 28.5" className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>HbA1c Level</label>
                <input type="number" step="0.1" name="HbA1c_level" value={form.HbA1c_level}
                  onChange={handleChange} required placeholder="e.g. 7.2" className={inputClass}/>
              </div>
              <div>
                <label className={labelClass}>Blood Glucose</label>
                <input type="number" name="blood_glucose_level" value={form.blood_glucose_level}
                  onChange={handleChange} required placeholder="e.g. 180" className={inputClass}/>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? '🔄 Analyzing...' : '🔬 Predict Diabetes'}
            </button>
          </form>
        </div>

        {result && (
          <div className={`mt-6 bg-white rounded-xl shadow p-6 border-l-4 ${
            result.prediction === 1 ? 'border-red-500' : 'border-green-500'}`}>
            <h2 className="text-xl font-bold mb-2">Prediction Result</h2>
            <p className={`text-2xl font-bold ${result.prediction === 1 ? 'text-red-600' : 'text-green-600'}`}>
              {result.prediction === 1 ? '⚠️' : '✅'} {result.result}
            </p>
            <p className="text-gray-500 mt-2">
              Confidence: <span className="font-semibold">{result.confidence}%</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}