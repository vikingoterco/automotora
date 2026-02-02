// src/app/api/vehiculos/route.js
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    // Extraer parámetros de búsqueda de la URL (opcional)
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado') // ?estado=DISPONIBLE
    const marca = searchParams.get('marca')   // ?marca=Toyota
    
    // Construir el objeto where dinámicamente
    const where = {}
    
    if (estado) {
      where.estado = estado
    } else {
      // Por defecto, solo mostrar disponibles
      where.estado = 'DISPONIBLE'
    }
    
    if (marca) {
      where.marca = {
        contains: marca,
        mode: 'insensitive' // No distingue mayúsculas/minúsculas
      }
    }
    
    // Consultar vehículos con Prisma
    const vehiculos = await prisma.vehiculo.findMany({
      where: where,
      include: {
        imagenes: {
          orderBy: {
            orden: 'asc' // Ordenar imágenes por el campo orden
          }
        },
        caracteristicas: true
      },
      orderBy: {
        createdAt: 'desc' // Los más nuevos primero
      }
    })
    
    // Respuesta exitosa
    return Response.json({
      success: true,
      count: vehiculos.length,
      vehiculos: vehiculos
    })
    
  } catch (error) {
    // Manejo de errores
    console.error('Error al obtener vehículos:', error)
    
    return Response.json({
      success: false,
      error: 'Error al obtener los vehículos',
      details: error.message
    }, {
      status: 500
    })
  }
}