'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [vehiculos, setVehiculos] = useState([])
  const [consultas, setConsultas] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/admin/login')
      return
    }

    setUser(JSON.parse(userData))
    cargarDatos(token)
  }, [router])

  const cargarDatos = async (token) => {
    try {
      // Cargar vehículos
      const resVehiculos = await fetch('/api/vehiculos')
      const dataVehiculos = await resVehiculos.json()
      setVehiculos(dataVehiculos.vehiculos || [])

      // Cargar consultas
      const resConsultas = await fetch('/api/consultas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const dataConsultas = await resConsultas.json()
      setConsultas(dataConsultas.consultas || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id, marca, modelo) => {
    if (!confirm(`¿Seguro que querés eliminar ${marca} ${modelo}?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/vehiculos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Vehículo eliminado')
        cargarDatos(token)
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      alert('❌ Error al eliminar: ' + error.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/admin/login')
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🚗 Dashboard Automotora</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.nombre} ({user?.rol})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Vehículos</h3>
            <p className="text-3xl font-bold text-blue-600">{vehiculos.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Consultas Pendientes</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {consultas.filter(c => c.estado === 'PENDIENTE').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Reservados</h3>
            <p className="text-3xl font-bold text-green-600">
              {vehiculos.filter(v => v.estado === 'RESERVADO').length}
            </p>
          </div>
        </div>

        {/* Vehículos */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Vehículos Recientes</h2>
              <button
                onClick={() => router.push('/admin/vehiculos/nuevo')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                ➕ Agregar Vehículo
              </button>
            </div>
          </div>
          <div className="p-6">
            {vehiculos.length === 0 ? (
              <p className="text-gray-500">No hay vehículos registrados</p>
            ) : (
              <div className="space-y-4">
                {vehiculos.slice(0, 5).map(vehiculo => (
                  <div key={vehiculo.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      {vehiculo.imagenes[0] ? (
                        <img 
                          src={vehiculo.imagenes[0].url} 
                          alt={vehiculo.marca}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          Sin foto
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ${vehiculo.precio.toLocaleString()} • {vehiculo.kilometraje} km
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        vehiculo.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-800' :
                        vehiculo.estado === 'RESERVADO' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {vehiculo.estado}
                      </span>
                      <button
                        onClick={() => router.push(`/admin/vehiculos/${vehiculo.id}/imagenes`)}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                        title="Agregar imágenes"
                      >
                        📸
                      </button>
                      <button
                        onClick={() => router.push(`/admin/vehiculos/${vehiculo.id}/editar`)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleEliminar(vehiculo.id, vehiculo.marca, vehiculo.modelo)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Consultas */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Consultas Recientes</h2>
          </div>
          <div className="p-6">
            {consultas.length === 0 ? (
              <p className="text-gray-500">No hay consultas</p>
            ) : (
              <div className="space-y-4">
                {consultas.slice(0, 5).map(consulta => (
                  <div key={consulta.id} className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{consulta.nombre}</h3>
                        <p className="text-sm text-gray-600">{consulta.email}</p>
                        <p className="text-sm mt-2">{consulta.mensaje}</p>
                        {consulta.vehiculo && (
                          <p className="text-xs text-gray-500 mt-1">
                            Sobre: {consulta.vehiculo.marca} {consulta.vehiculo.modelo}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        consulta.estado === 'PENDIENTE' ? 'bg-red-100 text-red-800' :
                        consulta.estado === 'CONTACTADO' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {consulta.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
