'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function HeartPredict() {
  const router = useRouter()
  const [form, setForm] = useState({
    General_Health: 'Good', Checkup: 'Within the past year',
    Exercise: 'Yes', Skin_Cancer: 'No', Other_Cancer: 'No',
    Depression: 'No', Diabetes: 'No', Arthritis: 'No',
    Sex: 'Male', Age_Category: '40-44',
    Height_cm: '', Weight_kg: '', BMI: '',
    Smoking_History: 'No', Alcohol_Consumption: '',
    Fruit_Consumption: '', Green_Vegetables_Consumption: '',
    FriedPotato_Consumption: ''
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict/heart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          Height_cm: parseFloat(form.Height_cm),
          Weight_kg: parseFloat(form.Weight_kg),
          BMI: parseFloat(form.BMI),
          Alcohol_Consumption: parseFloat(form.Alcohol_Consumption),
          Fruit_Consumption: parseFloat(form.Fruit_Consumption),
          Green_Vegetables_Consumption: parseFloat(form.Green_Vegetables_Consumption),
          FriedPotato_Consumption: parseFloat(form.FriedPotato_Consumption)
        })
      })

      const data = await response.json()
      setResult(data)

      // ✅ Bug 1 fixed: get user first
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // ✅ Bug 2 fixed: wrap in if(user) block
        const { data: patient } = await supabase
          .from('patients')
          .select('id')
          .eq('doctor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // ✅ Bug 3 fixed: save prediction if patient exists
        if (patient) {
          await supabase.from('predictions').insert({
            patient_id: patient.id,
            disease_type: 'heart',
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

  const selectClass = "mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
  const inputClass = "mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
  const labelClass = "block text-sm font-medium text-gray-700"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <button onClick={() => router.back()}
            className="text-red-600 hover:underline text-sm mb-4 block">
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-red-600">❤️ Heart Disease Prediction</h1>
              <p className="text-gray-500 text-sm mt-1">Fill in patient health details</p>
            </div>
            <button
              onClick={() => setForm({
                General_Health: 'Good', Checkup: 'Within the past year',
                Exercise: 'Yes', Skin_Cancer: 'No', Other_Cancer: 'No',
                Depression: 'No', Diabetes: 'No', Arthritis: 'No',
                Sex: 'Male', Age_Category: '40-44',
                Height_cm: '170', Weight_kg: '70', BMI: '24.2',
                Smoking_History: 'No', Alcohol_Consumption: '2',
                Fruit_Consumption: '5', Green_Vegetables_Consumption: '4',
                FriedPotato_Consumption: '2'
              })}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition border border-red-200">
              🧪 Use Sample Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>General Health</label>
                <select name="General_Health" value={form.General_Health} onChange={handleChange} className={selectClass}>
                  {['Poor','Fair','Good','Very Good','Excellent'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Last Checkup</label>
                <select name="Checkup" value={form.Checkup} onChange={handleChange} className={selectClass}>
                  {['Within the past year','Within the past 2 years','Within the past 5 years','5 or more years ago'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[['Exercise','Exercise regularly?'],['Skin_Cancer','Skin Cancer?'],
                ['Other_Cancer','Other Cancer?'],['Depression','Depression?'],
                ['Diabetes','Diabetes?'],['Arthritis','Arthritis?'],
                ['Smoking_History','Smoking History?']].map(([name, label]) => (
                <div key={name}>
                  <label className={labelClass}>{label}</label>
                  <select name={name} value={form[name]} onChange={handleChange} className={selectClass}>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              ))}
              <div>
                <label className={labelClass}>Sex</label>
                <select name="Sex" value={form.Sex} onChange={handleChange} className={selectClass}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Age Category</label>
              <select name="Age_Category" value={form.Age_Category} onChange={handleChange} className={selectClass}>
                {['18-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[['Height_cm','Height (cm)','e.g. 170'],
                ['Weight_kg','Weight (kg)','e.g. 70'],
                ['BMI','BMI','e.g. 24.2']].map(([name, label, ph]) => (
                <div key={name}>
                  <label className={labelClass}>{label}</label>
                  <input type="number" step="0.01" name={name}
                    value={form[name]} onChange={handleChange} required
                    placeholder={ph} className={inputClass}/>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[['Alcohol_Consumption','Alcohol (drinks/week)','e.g. 2'],
                ['Fruit_Consumption','Fruit (servings/week)','e.g. 5'],
                ['Green_Vegetables_Consumption','Green Veg (servings/week)','e.g. 4'],
                ['FriedPotato_Consumption','Fried Potato (servings/week)','e.g. 2']].map(([name, label, ph]) => (
                <div key={name}>
                  <label className={labelClass}>{label}</label>
                  <input type="number" step="0.1" name={name}
                    value={form[name]} onChange={handleChange} required
                    placeholder={ph} className={inputClass}/>
                </div>
              ))}
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50">
              {loading ? '🔄 Analyzing...' : '❤️ Predict Heart Disease'}
            </button>
          </form>
        </div>

        {result && (
          <div className={`mt-6 bg-white rounded-xl shadow p-6 border-l-4 ${
            result.prediction === 1 ? 'border-red-500' : 'border-green-500'}`}>
            <h2 className="text-xl font-bold mb-2">Prediction Result</h2>
            <p className={`text-2xl font-bold ${
              result.prediction === 1 ? 'text-red-600' : 'text-green-600'}`}>
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