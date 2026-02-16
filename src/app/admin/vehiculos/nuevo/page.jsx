'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoVehiculoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    precio: '',
    kilometraje: 0,
    combustible: 'NAFTA',
    transmision: 'MANUAL',
    color: '',
    puertas: 4,
    motor: '',
    descripcion: '',
    destacado: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      const res = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          anio: parseInt(formData.anio),
          precio: parseFloat(formData.precio),
          kilometraje: parseInt(formData.kilometraje),
          puertas: parseInt(formData.puertas)
        })
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Vehículo creado exitosamente')
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Error al crear vehículo')
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">➕ Agregar Vehículo</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Volver
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Toyota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Corolla"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año *
                  </label>
                  <input
                    type="number"
                    name="anio"
                    value={formData.anio}
                    onChange={handleChange}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (USD) *
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                    min="0"
                    step="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilometraje *
                  </label>
                  <input
                    type="number"
                    name="kilometraje"
                    value={formData.kilometraje}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Blanco"
                  />
                </div>
              </div>
            </div>

            {/* Especificaciones */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Especificaciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Combustible *
                  </label>
                  <select
                    name="combustible"
                    value={formData.combustible}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NAFTA">Nafta</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRICO">Eléctrico</option>
                    <option value="HIBRIDO">Híbrido</option>
                    <option value="GNC">GNC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmisión *
                  </label>
                  <select
                    name="transmision"
                    value={formData.transmision}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="AUTOMATICA">Automática</option>
                    <option value="SECUENCIAL">Secuencial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puertas *
                  </label>
                  <input
                    type="number"
                    name="puertas"
                    value={formData.puertas}
                    onChange={handleChange}
                    required
                    min="2"
                    max="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motor (opcional)
                  </label>
                  <input
                    type="text"
                    name="motor"
                    value={formData.motor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2.0 16v"
                  />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción detallada del vehículo..."
              />
            </div>

            {/* Destacado */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="destacado"
                checked={formData.destacado}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Destacar este vehículo en la página principal
              </label>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
              >
                {loading ? 'Guardando...' : '✅ Guardar Vehículo'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
