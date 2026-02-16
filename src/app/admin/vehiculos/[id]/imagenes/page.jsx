'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ImagenesVehiculoPage() {
  const router = useRouter()
  const params = useParams()
  const [vehiculo, setVehiculo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    cargarVehiculo()
  }, [])

  const cargarVehiculo = async () => {
    try {
      const res = await fetch(`/api/vehiculos/${params.id}`)
      const data = await res.json()

      if (data.success) {
        setVehiculo(data.vehiculo)
      } else {
        setError('No se pudo cargar el vehículo')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length > 10) {
      alert('Máximo 10 imágenes por vez')
      return
    }

    setSelectedFiles(files)

    // Crear previews
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Seleccioná al menos una imagen')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Convertir todas las imágenes a base64
      const base64Images = await Promise.all(
        selectedFiles.map(file => convertToBase64(file))
      )

      // Subir a Cloudinary
      const token = localStorage.getItem('token')
      const resUpload = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ images: base64Images })
      })

      const dataUpload = await resUpload.json()

      if (!dataUpload.success) {
        throw new Error(dataUpload.error || 'Error al subir imágenes')
      }

      // Asociar imágenes al vehículo
      const resAsociar = await fetch(`/api/vehiculos/${params.id}/imagenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imagenes: dataUpload.images.map((img, index) => ({
            url: img.url,
            orden: (vehiculo?.imagenes?.length || 0) + index
          }))
        })
      })

      const dataAsociar = await resAsociar.json()

      if (dataAsociar.success) {
        alert(`✅ ${dataUpload.images.length} imágenes agregadas exitosamente`)
        setSelectedFiles([])
        setPreviews([])
        cargarVehiculo()
      } else {
        throw new Error(dataAsociar.error || 'Error al asociar imágenes')
      }
    } catch (err) {
      setError('Error: ' + err.message)
      alert('❌ ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleEliminarImagen = async (imagenId) => {
    if (!confirm('¿Eliminar esta imagen?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/vehiculos/${params.id}/imagenes/${imagenId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Imagen eliminada')
        cargarVehiculo()
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (err) {
      alert('❌ Error al eliminar')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">📸 Imágenes del Vehículo</h1>
            {vehiculo && (
              <p className="text-gray-600 text-sm mt-1">
                {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Volver
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Imágenes actuales */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            Imágenes Actuales ({vehiculo?.imagenes?.length || 0})
          </h2>
          
          {vehiculo?.imagenes?.length === 0 ? (
            <p className="text-gray-500">No hay imágenes todavía</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vehiculo.imagenes.map((imagen, index) => (
                <div key={imagen.id} className="relative group">
                  <img
                    src={imagen.url}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-48 object-cover rounded"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleEliminarImagen(imagen.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700 opacity-0 group-hover:opacity-100 transition"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Orden: {imagen.orden}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subir nuevas imágenes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Agregar Nuevas Imágenes</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar imágenes (máximo 10)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos: JPG, PNG, WEBP • Tamaño máximo: 5MB por imagen
              </p>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Vista previa ({previews.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded border-2 border-blue-500"
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
            >
              {uploading ? 'Subiendo...' : `📤 Subir ${selectedFiles.length} imagen(es)`}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}