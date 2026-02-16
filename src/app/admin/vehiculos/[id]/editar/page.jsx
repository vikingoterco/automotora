'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

/**
 * Página para editar un vehículo existente
 * 
 * Features:
 * - Carga datos actuales del vehículo
 * - Formulario pre-llenado
 * - Validaciones en tiempo real
 * - Actualización con PUT
 * - Manejo de estados y errores
 */
export default function EditarVehiculoPage() {
  const router = useRouter()
  const params = useParams()
  const vehiculoId = params.id

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    precio: '',
    kilometraje: '',
    combustible: 'NAFTA',
    transmision: 'MANUAL',
    color: '',
    puertas: 4,
    motor: '',
    descripcion: '',
    estado: 'DISPONIBLE',
    destacado: false
  })

  useEffect(() => {
    cargarVehiculo()
  }, [vehiculoId])

  const cargarVehiculo = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const res = await fetch(`/api/vehiculos/${vehiculoId}`)
      const data = await res.json()

      if (data.success) {
        const v = data.vehiculo
        setFormData({
          marca: v.marca,
          modelo: v.modelo,
          anio: v.anio,
          precio: v.precio,
          kilometraje: v.kilometraje,
          combustible: v.combustible,
          transmision: v.transmision,
          color: v.color,
          puertas: v.puertas,
          motor: v.motor || '',
          descripcion: v.descripcion || '',
          estado: v.estado,
          destacado: v.destacado
        })
      } else {
        setError('No se pudo cargar el vehículo')
      }
    } catch (error) {
      console.error('Error cargando vehículo:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validarFormulario = () => {
    if (!formData.marca.trim()) {
      alert('❌ La marca es obligatoria')
      return false
    }

    if (!formData.modelo.trim()) {
      alert('❌ El modelo es obligatorio')
      return false
    }

    if (formData.anio < 1900 || formData.anio > new Date().getFullYear() + 1) {
      alert('❌ El año no es válido')
      return false
    }

    if (formData.precio <= 0) {
      alert('❌ El precio debe ser mayor a 0')
      return false
    }

    if (formData.kilometraje < 0) {
      alert('❌ El kilometraje no puede ser negativo')
      return false
    }

    if (!formData.color.trim()) {
      alert('❌ El color es obligatorio')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) return

    setGuardando(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')

      // Preparar datos - convertir a números donde corresponde
      const dataToSend = {
        ...formData,
        anio: parseInt(formData.anio),
        precio: parseFloat(formData.precio),
        kilometraje: parseInt(formData.kilometraje),
        puertas: parseInt(formData.puertas)
      }

      const res = await fetch(`/api/vehiculos/${vehiculoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Vehículo actualizado exitosamente')
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Error al actualizar')
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al guardar los cambios')
      alert('❌ Error al guardar los cambios')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando vehículo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
          >
            <span>←</span> Volver al Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            ✏️ Editar Vehículo
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* Sección: Datos Básicos */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
              📋 Datos Básicos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Toyota"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Corolla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color *
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Blanco"
                />
              </div>
            </div>
          </div>

          {/* Sección: Precios y Kilometraje */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
              💰 Precio y Kilometraje
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (USD) *
                </label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 15000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilometraje *
                </label>
                <input
                  type="number"
                  name="kilometraje"
                  value={formData.kilometraje}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 50000"
                />
              </div>
            </div>
          </div>

          {/* Sección: Características Técnicas */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
              ⚙️ Características Técnicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Combustible *
                </label>
                <select
                  name="combustible"
                  value={formData.combustible}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="NAFTA">Nafta</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRICO">Eléctrico</option>
                  <option value="HIBRIDO">Híbrido</option>
                  <option value="GNC">GNC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transmisión *
                </label>
                <select
                  name="transmision"
                  value={formData.transmision}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MANUAL">Manual</option>
                  <option value="AUTOMATICA">Automática</option>
                  <option value="SECUENCIAL">Secuencial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puertas *
                </label>
                <select
                  name="puertas"
                  value={formData.puertas}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="2">2 puertas</option>
                  <option value="3">3 puertas</option>
                  <option value="4">4 puertas</option>
                  <option value="5">5 puertas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motor (opcional)
                </label>
                <input
                  type="text"
                  name="motor"
                  value={formData.motor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 2.0 TSI"
                />
              </div>
            </div>
          </div>

          {/* Sección: Estado y Descripción */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
              📝 Estado y Descripción
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="RESERVADO">Reservado</option>
                  <option value="VENDIDO">Vendido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción detallada del vehículo..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="destacado"
                  id="destacado"
                  checked={formData.destacado}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="destacado" className="ml-2 text-sm text-gray-700">
                  ⭐ Marcar como destacado
                </label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={guardando}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                guardando
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {guardando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              disabled={guardando}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
