'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Página con lista COMPLETA de vehículos
 * 
 * Features:
 * - Tabla profesional con todos los vehículos
 * - Búsqueda en tiempo real
 * - Filtros por estado
 * - Ordenamiento por columnas
 * - Acciones rápidas (editar, imágenes, eliminar)
 * - Paginación (opcional)
 */
export default function ListaVehiculosPage() {
  const router = useRouter()
  
  const [vehiculos, setVehiculos] = useState([])
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [ordenarPor, setOrdenarPor] = useState('recientes') // recientes, precio_asc, precio_desc, km_asc, km_desc

  useEffect(() => {
    cargarVehiculos()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [vehiculos, busqueda, filtroEstado, ordenarPor])

  const cargarVehiculos = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const res = await fetch('/api/vehiculos')
      const data = await res.json()

      if (data.success) {
        setVehiculos(data.vehiculos || [])
      }
    } catch (error) {
      console.error('Error cargando vehículos:', error)
      alert('❌ Error al cargar vehículos')
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    let resultado = [...vehiculos]

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase()
      resultado = resultado.filter(v =>
        v.marca.toLowerCase().includes(termino) ||
        v.modelo.toLowerCase().includes(termino) ||
        v.color.toLowerCase().includes(termino) ||
        v.anio.toString().includes(termino)
      )
    }

    // Filtro por estado
    if (filtroEstado !== 'TODOS') {
      resultado = resultado.filter(v => v.estado === filtroEstado)
    }

    // Ordenamiento
    switch (ordenarPor) {
      case 'precio_asc':
        resultado.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio))
        break
      case 'precio_desc':
        resultado.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio))
        break
      case 'km_asc':
        resultado.sort((a, b) => a.kilometraje - b.kilometraje)
        break
      case 'km_desc':
        resultado.sort((a, b) => b.kilometraje - a.kilometraje)
        break
      case 'recientes':
      default:
        resultado.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
    }

    setVehiculosFiltrados(resultado)
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
        cargarVehiculos()
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      alert('❌ Error al eliminar: ' + error.message)
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      DISPONIBLE: 'bg-green-100 text-green-800',
      RESERVADO: 'bg-yellow-100 text-yellow-800',
      VENDIDO: 'bg-gray-100 text-gray-800'
    }
    return badges[estado] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando vehículos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
              >
                <span>←</span> Volver al Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                🚗 Todos los Vehículos
              </h1>
            </div>

            <button
              onClick={() => router.push('/admin/vehiculos/nuevo')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ➕ Nuevo Vehículo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-blue-600">{vehiculos.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Disponibles</p>
            <p className="text-2xl font-bold text-green-600">
              {vehiculos.filter(v => v.estado === 'DISPONIBLE').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Reservados</p>
            <p className="text-2xl font-bold text-yellow-600">
              {vehiculos.filter(v => v.estado === 'RESERVADO').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Vendidos</p>
            <p className="text-2xl font-bold text-gray-600">
              {vehiculos.filter(v => v.estado === 'VENDIDO').length}
            </p>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔍 Buscar
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Marca, modelo, color, año..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🏷️ Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TODOS">Todos</option>
                <option value="DISPONIBLE">Disponibles</option>
                <option value="RESERVADO">Reservados</option>
                <option value="VENDIDO">Vendidos</option>
              </select>
            </div>

            {/* Ordenar Por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📊 Ordenar por
              </label>
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="km_asc">Km: menor a mayor</option>
                <option value="km_desc">Km: mayor a menor</option>
              </select>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Mostrando {vehiculosFiltrados.length} de {vehiculos.length} vehículos
          </div>
        </div>

        {/* Tabla de Vehículos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {vehiculosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No se encontraron vehículos</p>
              <p className="text-gray-400 text-sm mt-2">
                Intentá con otros filtros o términos de búsqueda
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vehículo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Año
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Km
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Imágenes
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehiculosFiltrados.map((vehiculo) => (
                    <tr key={vehiculo.id} className="hover:bg-gray-50">
                      {/* Vehículo con imagen */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {vehiculo.imagenes?.[0] ? (
                            <img
                              src={vehiculo.imagenes[0].url}
                              alt={vehiculo.marca}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                              Sin foto
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {vehiculo.marca} {vehiculo.modelo}
                            </p>
                            <p className="text-sm text-gray-500">
                              {vehiculo.color} • {vehiculo.combustible}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Año */}
                      <td className="px-4 py-4 text-gray-700">
                        {vehiculo.anio}
                      </td>

                      {/* Precio */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900">
                          ${parseFloat(vehiculo.precio).toLocaleString()}
                        </span>
                      </td>

                      {/* Kilometraje */}
                      <td className="px-4 py-4 text-gray-700">
                        {vehiculo.kilometraje.toLocaleString()} km
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(vehiculo.estado)}`}>
                          {vehiculo.estado}
                        </span>
                      </td>

                      {/* Cantidad de imágenes */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
                          {vehiculo.imagenes?.length || 0}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/vehiculos/${vehiculo.id}/imagenes`)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="Gestionar imágenes"
                          >
                            📸
                          </button>
                          <button
                            onClick={() => router.push(`/admin/vehiculos/${vehiculo.id}/editar`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleEliminar(vehiculo.id, vehiculo.marca, vehiculo.modelo)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
