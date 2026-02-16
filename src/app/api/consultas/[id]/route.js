// src/app/api/consultas/[id]/route.js

import prisma from '../../../../lib/prisma.js'

const estadosValidos = ["PENDIENTE", "CONTACTADO", "CERRADO"]

function extraerIdDeUrl(request) {
  const pathname = request.nextUrl.pathname
  return pathname.split("/").pop()
}

/* ========================================
   GET - Obtener una consulta por ID
======================================== */
export async function GET(request) {
  try {
    const id = extraerIdDeUrl(request)

    const consulta = await prisma.consulta.findUnique({
      where: { id },
      include: {
        vehiculo: true
      }
    })

    if (!consulta) {
      return Response.json(
        { success: false, error: "Consulta no encontrada" },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      consulta: consulta
    })

  } catch (error) {
    console.error("❌ Error en GET consulta por ID:", error)

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/* ========================================
   PUT - Actualizar estado de consulta
======================================== */
export async function PUT(request) {
  try {
    const id = extraerIdDeUrl(request)
    const datos = await request.json()

    // Verificar que la consulta existe
    const consultaExistente = await prisma.consulta.findUnique({
      where: { id }
    })

    if (!consultaExistente) {
      return Response.json(
        { success: false, error: "Consulta no encontrada" },
        { status: 404 }
      )
    }

    // Validar estado si se proporciona
    if (datos.estado && !estadosValidos.includes(datos.estado)) {
      return Response.json(
        { 
          success: false, 
          error: `Estado inválido. Opciones: ${estadosValidos.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Actualizar consulta
    const consultaActualizada = await prisma.consulta.update({
      where: { id },
      data: {
        estado: datos.estado || consultaExistente.estado
      },
      include: {
        vehiculo: {
          select: {
            id: true,
            marca: true,
            modelo: true
          }
        }
      }
    })

    console.log(`✅ Consulta ${id} actualizada a estado: ${consultaActualizada.estado}`)

    return Response.json({
      success: true,
      consulta: consultaActualizada,
      mensaje: "Consulta actualizada exitosamente"
    })

  } catch (error) {
    console.error("❌ Error en PUT consulta:", error)

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/* ========================================
   DELETE - Eliminar consulta
======================================== */
export async function DELETE(request) {
  try {
    const id = extraerIdDeUrl(request)

    // Verificar que existe
    const consultaExistente = await prisma.consulta.findUnique({
      where: { id }
    })

    if (!consultaExistente) {
      return Response.json(
        { success: false, error: "Consulta no encontrada" },
        { status: 404 }
      )
    }

    // Eliminar
    await prisma.consulta.delete({
      where: { id }
    })

    console.log(`🗑️  Consulta ${id} eliminada`)

    return Response.json({
      success: true,
      mensaje: "Consulta eliminada exitosamente"
    })

  } catch (error) {
    console.error("❌ Error en DELETE consulta:", error)

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
