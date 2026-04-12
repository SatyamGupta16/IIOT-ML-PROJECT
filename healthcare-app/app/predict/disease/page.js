'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const SYMPTOMS = [
  'itching','skin_rash','nodal_skin_eruptions','continuous_sneezing','shivering',
  'chills','joint_pain','stomach_pain','acidity','ulcers_on_tongue','muscle_wasting',
  'vomiting','burning_micturition','spotting_ urination','fatigue','weight_gain',
  'anxiety','cold_hands_and_feets','mood_swings','weight_loss','restlessness',
  'lethargy','patches_in_throat','irregular_sugar_level','cough','high_fever',
  'sunken_eyes','breathlessness','sweating','dehydration','indigestion','headache',
  'yellowish_skin','dark_urine','nausea','loss_of_appetite','pain_behind_the_eyes',
  'back_pain','constipation','abdominal_pain','diarrhoea','mild_fever','yellow_urine',
  'yellowing_of_eyes','acute_liver_failure','fluid_overload','swelling_of_stomach',
  'swelled_lymph_nodes','malaise','blurred_and_distorted_vision','phlegm',
  'throat_irritation','redness_of_eyes','sinus_pressure','runny_nose','congestion',
  'chest_pain','weakness_in_limbs','fast_heart_rate','pain_during_bowel_movements',
  'pain_in_anal_region','bloody_stool','irritation_in_anus','neck_pain','dizziness',
  'cramps','bruising','obesity','swollen_legs','swollen_blood_vessels',
  'puffy_face_and_eyes','enlarged_thyroid','brittle_nails','swollen_extremeties',
  'excessive_hunger','extra_marital_contacts','drying_and_tingling_lips',
  'slurred_speech','knee_pain','hip_joint_pain','muscle_weakness','stiff_neck',
  'swelling_joints','movement_stiffness','spinning_movements','loss_of_balance',
  'unsteadiness','weakness_of_one_body_side','loss_of_smell','bladder_discomfort',
  'foul_smell_of urine','continuous_feel_of_urine','passage_of_gases',
  'internal_itching','toxic_look_(typhos)','depression','irritability','muscle_pain',
  'altered_sensorium','red_spots_over_body','belly_pain','abnormal_menstruation',
  'dischromic _patches','watering_from_eyes','increased_appetite','polyuria',
  'family_history','mucoid_sputum','rusty_sputum','lack_of_concentration',
  'visual_disturbances','receiving_blood_transfusion','receiving_unsterile_injections',
  'coma','stomach_bleeding','distention_of_abdomen','history_of_alcohol_consumption',
  'fluid_overload_1','blood_in_sputum','prominent_veins_on_calf','palpitations',
  'painful_walking','pus_filled_pimples','blackheads','scurring','skin_peeling',
  'silver_like_dusting','small_dents_in_nails','inflammatory_nails','blister',
  'red_sore_around_nose','yellow_crust_ooze'
]

export default function DiseasePredict() {
  const router = useRouter()
  const [selected, setSelected] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const toggleSymptom = (symptom) => {
    setSelected(prev => ({
      ...prev,
      [symptom]: prev[symptom] ? 0 : 1
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const symptoms = {}
    SYMPTOMS.forEach(s => { symptoms[s] = selected[s] || 0 })

    try {
      const response = await fetch('http://localhost:8000/predict/disease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms })
      })

      const data = await response.json()
      setResult(data)

      // ✅ Fixed: use doctor_id instead of profile_id
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: patient } = await supabase
          .from('patients')
          .select('id')
          .eq('doctor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (patient) {
          await supabase.from('predictions').insert({
            patient_id: patient.id,
            disease_type: 'general',
            input_data: symptoms,
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

  const filteredSymptoms = SYMPTOMS.filter(s =>
    s.toLowerCase().includes(search.toLowerCase())
  )

  const selectedCount = Object.values(selected).filter(v => v === 1).length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <button
            onClick={() => router.back()}
            className="text-green-600 hover:underline text-sm mb-4 block"
          >
            ← Back to Dashboard
          </button>

          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-green-600">🦠 Disease Prediction</h1>
              <p className="text-gray-500 text-sm mt-1">
                Select all symptoms the patient is experiencing
              </p>
            </div>

            <button
              onClick={() => setSelected({
                itching: 1,
                skin_rash: 1,
                nodal_skin_eruptions: 1,
                shivering: 1,
                chills: 1
              })}
              className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition border border-green-200"
            >
              🧪 Use Sample Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 mb-4 flex gap-4 items-center">
          <input
            type="text"
            placeholder="🔍 Search symptoms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-sm font-medium text-green-600 whitespace-nowrap">
            {selectedCount} selected
          </span>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredSymptoms.map(symptom => (
              <label
                key={symptom}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition ${
                  selected[symptom]
                    ? 'bg-green-50 border-green-400'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!selected[symptom]}
                  onChange={() => toggleSymptom(symptom)}
                  className="accent-green-500"
                />
                <span className="text-xs text-gray-700 capitalize">
                  {symptom.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg mb-4">
              {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || selectedCount === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading
              ? '🔄 Analyzing symptoms...'
              : `🔬 Predict Disease (${selectedCount} symptoms selected)`}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <h2 className="text-xl font-bold mb-2">Prediction Result</h2>
            <p className="text-2xl font-bold text-green-600">🦠 {result.result}</p>
            <p className="text-gray-500 mt-2">
              Confidence: <span className="font-semibold">{result.confidence}%</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}