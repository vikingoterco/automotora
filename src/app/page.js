'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">🚗</h1>
        <h2 className="text-4xl font-bold mb-6">Sistema Automotora</h2>
        <p className="text-xl mb-8">Gestión completa de vehículos y consultas</p>
        
        <div className="space-x-4">
          <button
            onClick={() => router.push('/admin/login')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Acceso Administradores
          </button>
          <button
            onClick={() => router.push('/catalogo')}
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Ver Catálogo
          </button>
        </div>

        <div className="mt-12 text-sm opacity-75">
          <p>Backend: Next.js + PostgreSQL + Prisma</p>
          <p>Upload: Cloudinary | Auth: JWT</p>
        </div>
      </div>
    </div>
  )
}
