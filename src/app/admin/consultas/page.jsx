'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Página de gestión de consultas
 * 
 * Features:
 * - Lista completa de consultas
 * - Filtros por estado
 * - Búsqueda por cliente
 * - Ver vehículo relacionado
 * - Cambiar estado rápido
 * - Responder consulta
 */
export default function ConsultasPage() {
  const router = useRouter()
  
  const [consultas, setConsultas] = useState([])
  const [consultasFiltradas, setConsultasFiltradas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  useEffect(() => {
    cargarConsultas()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [consultas, busqueda, filtroEstado])

  const cargarConsultas = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const res = await fetch('/api/consultas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await res.json()

      if (data.success) {
        setConsultas(data.consultas || [])
      }
    } catch (error) {
      console.error('Error cargando consultas:', error)
      alert('❌ Error al cargar consultas')
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    let resultado = [...consultas]

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase()
      resultado = resultado.filter(c =>
        c.nombre.toLowerCase().includes(termino) ||
        c.email.toLowerCase().includes(termino) ||
        c.telefono.includes(termino) ||
        c.mensaje.toLowerCase().includes(termino)
      )
    }

    // Filtro por estado
    if (filtroEstado !== 'TODOS') {
      resultado = resultado.filter(c => c.estado === filtroEstado)
    }

    // Ordenar por fecha (más recientes primero)
    resultado.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    setConsultasFiltradas(resultado)
  }

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/consultas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Estado actualizado')
        cargarConsultas()
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      alert('❌ Error al actualizar: ' + error.message)
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      PENDIENTE: 'bg-red-100 text-red-800',
      CONTACTADO: 'bg-blue-100 text-blue-800',
      CERRADO: 'bg-gray-100 text-gray-800'
    }
    return badges[estado] || 'bg-gray-100 text-gray-800'
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando consultas...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">
            💬 Consultas de Clientes
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-red-600">
              {consultas.filter(c => c.estado === 'PENDIENTE').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Contactadas</p>
            <p className="text-2xl font-bold text-blue-600">
              {consultas.filter(c => c.estado === 'CONTACTADO').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Cerradas</p>
            <p className="text-2xl font-bold text-gray-600">
              {consultas.filter(c => c.estado === 'CERRADO').length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔍 Buscar
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre, email, teléfono, mensaje..."
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
                <option value="TODOS">Todas</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="CONTACTADO">Contactadas</option>
                <option value="CERRADO">Cerradas</option>
              </select>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Mostrando {consultasFiltradas.length} de {consultas.length} consultas
          </div>
        </div>

        {/* Lista de Consultas */}
        <div className="space-y-4">
          {consultasFiltradas.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">No hay consultas</p>
              <p className="text-gray-400 text-sm mt-2">
                Las consultas de los clientes aparecerán aquí
              </p>
            </div>
          ) : (
            consultasFiltradas.map((consulta) => (
              <div
                key={consulta.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Info del cliente */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {consulta.nombre}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(consulta.estado)}`}>
                        {consulta.estado}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span>📧 {consulta.email}</span>
                      <span>📱 {consulta.telefono}</span>
                      <span>🕐 {formatearFecha(consulta.createdAt)}</span>
                    </div>

                    {/* Vehículo relacionado */}
                    {consulta.vehiculo && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg inline-block">
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          Consulta sobre:
                        </p>
                        <p className="text-sm font-semibold text-blue-900">
                          {consulta.vehiculo.marca} {consulta.vehiculo.modelo} {consulta.vehiculo.anio}
                        </p>
                      </div>
                    )}

                    {/* Mensaje */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {consulta.mensaje}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t">
                  {consulta.estado === 'PENDIENTE' && (
                    <button
                      onClick={() => handleCambiarEstado(consulta.id, 'CONTACTADO')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      ✓ Marcar como Contactado
                    </button>
                  )}
                  
                  {consulta.estado === 'CONTACTADO' && (
                    <button
                      onClick={() => handleCambiarEstado(consulta.id, 'CERRADO')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      ✓ Cerrar Consulta
                    </button>
                  )}

                  {consulta.estado === 'CERRADO' && (
                    <button
                      onClick={() => handleCambiarEstado(consulta.id, 'PENDIENTE')}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      ↻ Reabrir
                    </button>
                  )}

                  {/* Botón para copiar email */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(consulta.email)
                      alert('✅ Email copiado al portapapeles')
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    📋 Copiar Email
                  </button>

                  {/* Botón para WhatsApp */}
                  <a
                    href={`https://wa.me/${consulta.telefono.replace(/\D/g, '')}?text=Hola ${consulta.nombre}, te contacto desde la automotora...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
