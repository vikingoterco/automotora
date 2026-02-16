'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

/**
 * Página para gestionar las imágenes de un vehículo
 * 
 * Features:
 * - Subir múltiples imágenes
 * - Preview antes de subir
 * - Drag & drop (opcional)
 * - Galería con vista previa
 * - Eliminar imágenes
 * - Validación de tamaño y tipo
 * - Loading states
 */
export default function ImagenesVehiculoPage() {
  const [vehiculo, setVehiculo] = useState(null)
  const [imagenes, setImagenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  
  const router = useRouter()
  const params = useParams()
  const vehiculoId = params.id

  useEffect(() => {
    cargarDatos()
  }, [vehiculoId])

  const cargarDatos = async () => {
    try {
      setError(null)
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.push('/admin/login')
        return
      }

      // Cargar datos del vehículo con sus imágenes
      const res = await fetch(`/api/vehiculos/${vehiculoId}`)
      const data = await res.json()
      
      if (data.success) {
        setVehiculo(data.vehiculo)
        setImagenes(data.vehiculo.imagenes || [])
      } else {
        setError(data.error || 'Error al cargar el vehículo')
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
      setError('Error al cargar datos del vehículo')
    } finally {
      setLoading(false)
    }
  }

  const validarArchivo = (file) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return 'Solo se permiten imágenes (JPG, PNG, WEBP, etc.)'
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024 // 5MB en bytes
    if (file.size > maxSize) {
      return 'La imagen no puede pesar más de 5MB'
    }

    return null
  }

  const handleSeleccionarArchivo = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const errorValidacion = validarArchivo(file)
    if (errorValidacion) {
      alert('❌ ' + errorValidacion)
      e.target.value = '' // Reset input
      return
    }

    // Mostrar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubirImagen = async () => {
    if (!preview) {
      alert('❌ Seleccioná una imagen primero')
      return
    }

    setSubiendo(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imagen: preview, // Base64
          vehiculoId: vehiculoId
        })
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Imagen subida exitosamente')
        setPreview(null) // Limpiar preview
        document.getElementById('file-upload').value = '' // Reset input
        cargarDatos() // Recargar galería
      } else {
        setError(data.error || 'Error al subir la imagen')
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error al subir:', error)
      setError('Error al subir la imagen')
      alert('❌ Error al subir la imagen')
    } finally {
      setSubiendo(false)
    }
  }

  const handleEliminarImagen = async (imagenId) => {
    if (!confirm('¿Seguro que querés eliminar esta imagen?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `/api/vehiculos/${vehiculoId}/imagenes/${imagenId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      const data = await res.json()

      if (data.success) {
        alert('✅ Imagen eliminada')
        cargarDatos() // Recargar galería
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('❌ Error al eliminar la imagen')
    }
  }

  const handleCancelarPreview = () => {
    setPreview(null)
    document.getElementById('file-upload').value = ''
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!vehiculo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Vehículo no encontrado
          </h2>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
          >
            <span>←</span> Volver al Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📸 Gestión de Imágenes
              </h1>
              <p className="text-gray-600 mt-1">
                {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Imágenes actuales</p>
              <p className="text-3xl font-bold text-blue-600">
                {imagenes.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mensajes de error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ❌ {error}
          </div>
        )}

        {/* Sección: Subir Nueva Imagen */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Subir Nueva Imagen
          </h2>
          
          {!preview ? (
            // Estado: Sin preview
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
              <div className="text-6xl mb-4">📷</div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleSeleccionarArchivo}
                disabled={subiendo}
                className="hidden"
                id="file-upload"
              />
              
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                📤 Seleccionar Imagen
              </label>
              
              <p className="mt-4 text-sm text-gray-500">
                PNG, JPG, WEBP hasta 5MB
              </p>
            </div>
          ) : (
            // Estado: Con preview
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-lg border"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSubirImagen}
                  disabled={subiendo}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    subiendo
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {subiendo ? '⏳ Subiendo...' : '✅ Confirmar y Subir'}
                </button>
                
                <button
                  onClick={handleCancelarPreview}
                  disabled={subiendo}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sección: Galería de Imágenes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Galería de Imágenes ({imagenes.length})
          </h2>

          {imagenes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-gray-500 text-lg">
                No hay imágenes todavía
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Subí la primera imagen del vehículo
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imagenes.map((imagen, index) => (
                <div
                  key={imagen.id}
                  className="relative group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Imagen */}
                  <img
                    src={imagen.url}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-64 object-cover"
                  />
                  
                  {/* Overlay con botón eliminar */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                    <button
                      onClick={() => handleEliminarImagen(imagen.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>

                  {/* Badge con número de orden */}
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    #{index + 1}
                  </div>

                  {/* Badge de imagen principal (si es la primera) */}
                  {index === 0 && (
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ⭐ Principal
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• La primera imagen será la imagen principal del vehículo</li>
            <li>• Recomendamos subir entre 5 y 10 imágenes por vehículo</li>
            <li>• Las imágenes se optimizan automáticamente</li>
            <li>• Tamaño máximo: 5MB por imagen</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
