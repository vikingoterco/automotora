// src/app/api/vehiculos/[id]/route.js

import prisma from '../../../../lib/prisma.js'

function formatearVehiculo(vehiculo) {
  return {
    ...vehiculo,
    precio: Number(vehiculo.precio)
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return Response.json(
        { success: false, error: "ID no proporcionado" },
        { status: 400 }
      )
    }

    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id },
      include: {
        imagenes: {
          orderBy: { orden: "asc" }
        },
        caracteristicas: true,
        consultas: true
      }
    })

    if (!vehiculo) {
      return Response.json(
        { success: false, error: "Vehículo no encontrado" },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      vehiculo: formatearVehiculo(vehiculo)
    })

  } catch (error) {
    console.error("Error en GET por ID:", error)

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
