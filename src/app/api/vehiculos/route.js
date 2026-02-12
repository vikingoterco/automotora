// src/app/api/vehiculos/route.js
import prisma from '../../../lib/prisma.js'

export async function GET(request) {
  try {
    // Consulta SIN filtros para ver TODO
    const vehiculos = await prisma.vehiculo.findMany({
      include: {
        imagenes: true,
        caracteristicas: true
      }
    })
    
    console.log('🔍 Vehículos encontrados:', vehiculos.length)
    console.log('📊 Primer vehículo:', vehiculos[0])
    
    return Response.json({
      success: true,
      count: vehiculos.length,
      vehiculos: vehiculos
    })
    
  } catch (error) {
    console.error('❌ Error completo:', error)
    
    return Response.json({
      success: false,
      error: error.message
    }, {
      status: 500
    })
  }
}