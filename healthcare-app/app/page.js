'use client'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  const features = [
    { icon: '🦠', title: 'Disease Prediction', desc: 'Predict diseases from 130+ symptoms using ML' },
    { icon: '🩺', title: 'Diabetes Detection', desc: 'Early diabetes risk assessment with high accuracy' },
    { icon: '❤️', title: 'Heart Disease', desc: 'Comprehensive cardiovascular risk analysis' },
    { icon: '👥', title: 'Patient Clustering', desc: 'Triage patients by priority level automatically' },
    { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time charts and prediction history' },
    { icon: '💊', title: 'Prescriptions', desc: 'Digital prescriptions and doctor notes' },
  ]

  const stats = [
    { value: '4', label: 'ML Models' },
    { value: '130+', label: 'Symptoms Tracked' },
    { value: '2', label: 'User Roles' },
    { value: '100%', label: 'Secure with RLS' },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold text-blue-600">HealthCare AI</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium">
            Login
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-6xl mb-6">🏥</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Healthcare
            <span className="text-blue-600"> Prediction System</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            Advanced machine learning models to predict diseases, assess risks,
            and help doctors make better clinical decisions.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push('/signup')}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-lg">
              🚀 Get Started Free
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition text-lg">
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-blue-200 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Everything You Need
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Powerful tools for doctors and patients
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            How It Works
          </h2>
          <p className="text-center text-gray-500 mb-10">Simple 3 step process</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '👤', title: 'Create Account', desc: 'Sign up as a Doctor or Patient in seconds' },
              { step: '02', icon: '📋', title: 'Enter Health Data', desc: 'Fill in symptoms or health parameters in the form' },
              { step: '03', icon: '🔬', title: 'Get AI Prediction', desc: 'Receive instant ML-powered diagnosis and risk assessment' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Built for Everyone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100">
              <div className="text-5xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-bold text-blue-600 mb-4">For Doctors</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                {[
                  '✅ Manage patient records',
                  '✅ Run ML predictions',
                  '✅ View analytics dashboard',
                  '✅ Write digital prescriptions',
                  '✅ Track prediction history',
                ].map(item => <li key={item}>{item}</li>)}
              </ul>
              <button
                onClick={() => router.push('/signup')}
                className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                Sign up as Doctor
              </button>
            </div>

            {/* Patient Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
              <div className="text-5xl mb-4">🧑‍💼</div>
              <h3 className="text-xl font-bold text-green-600 mb-4">For Patients</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                {[
                  '✅ View prediction results',
                  '✅ Access prescriptions',
                  '✅ Track health history',
                  '✅ View doctor notes',
                  '✅ Monitor health trends',
                ].map(item => <li key={item}>{item}</li>)}
              </ul>
              <button
                onClick={() => router.push('/signup')}
                className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium">
                Sign up as Patient
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-blue-600 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-200 mb-8">
            Join doctors and patients using AI-powered healthcare predictions
          </p>
          <button
            onClick={() => router.push('/signup')}
            className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition">
            🚀 Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🏥</span>
          <span className="text-white font-semibold">HealthCare AI</span>
        </div>
        <p className="text-sm">Built with Next.js · FastAPI · Supabase · Machine Learning</p>
        <p className="text-xs mt-2 text-gray-600">© 2026 HealthCare AI. All rights reserved.</p>
      </footer>

    </div>
  )
}