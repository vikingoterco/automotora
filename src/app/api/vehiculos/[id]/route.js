// src/app/api/vehiculos/[id]/route.js

import prisma from '../../../../lib/prisma.js'

/* ========================================
   FUNCIONES AUXILIARES
======================================== */

const combustiblesValidos = ["NAFTA", "DIESEL", "ELECTRICO", "HIBRIDO", "GNC"]
const transmisionesValidas = ["MANUAL", "AUTOMATICA", "SECUENCIAL"]
const estadosValidos = ["DISPONIBLE", "RESERVADO", "VENDIDO"]

function formatearVehiculo(vehiculo) {
  return {
    ...vehiculo,
    precio: Number(vehiculo.precio)
  }
}

function validarDatosActualizacion(datos) {
  const errores = []

  if (datos.marca !== undefined && !datos.marca?.trim()) {
    errores.push("La marca no puede estar vacía")
  }

  if (datos.modelo !== undefined && !datos.modelo?.trim()) {
    errores.push("El modelo no puede estar vacío")
  }

  if (datos.anio !== undefined) {
    const anio = Number(datos.anio)
    if (anio < 1900 || anio > new Date().getFullYear() + 1) {
      errores.push("Año inválido")
    }
  }

  if (datos.precio !== undefined) {
    const precio = Number(datos.precio)
    if (precio <= 0) {
      errores.push("El precio debe ser mayor a 0")
    }
  }

  if (datos.kilometraje !== undefined) {
    const km = Number(datos.kilometraje)
    if (km < 0) {
      errores.push("El kilometraje no puede ser negativo")
    }
  }

  if (datos.puertas !== undefined) {
    const puertas = Number(datos.puertas)
    if (puertas <= 0) {
      errores.push("La cantidad de puertas debe ser mayor a 0")
    }
  }

  if (datos.combustible && !combustiblesValidos.includes(datos.combustible)) {
    errores.push(`Combustible inválido. Opciones: ${combustiblesValidos.join(', ')}`)
  }

  if (datos.transmision && !transmisionesValidas.includes(datos.transmision)) {
    errores.push(`Transmisión inválida. Opciones: ${transmisionesValidas.join(', ')}`)
  }

  if (datos.estado && !estadosValidos.includes(datos.estado)) {
    errores.push(`Estado inválido. Opciones: ${estadosValidos.join(', ')}`)
  }

  return errores.length > 0 ? errores : null
}

function extraerIdDeUrl(request) {
  const pathname = request.nextUrl.pathname
  return pathname.split("/").pop()
}

/* ========================================
   GET - Obtener un vehículo por ID
======================================== */
export async function GET(request) {
  try {
    const id = extraerIdDeUrl(request)

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
    console.error("❌ Error en GET por ID:", error)

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/* ========================================
   PUT - Actualizar un vehículo
======================================== */
export async function PUT(request) {
  try {
    const id = extraerIdDeUrl(request)

    if (!id) {
      return Response.json(
        { success: false, error: "ID no proporcionado" },
        { status: 400 }
      )
    }

    const datos = await request.json()

    // Validar que el vehículo existe
    const vehiculoExistente = await prisma.vehiculo.findUnique({
      where: { id }
    })

    if (!vehiculoExistente) {
      return Response.json(
        { success: false, error: "Vehículo no encontrado" },
        { status: 404 }
      )
    }

    // Validar datos
    const erroresValidacion = validarDatosActualizacion(datos)
    if (erroresValidacion) {
      return Response.json(
        { success: false, errors: erroresValidacion },
        { status: 400 }
      )
    }

    // Preparar datos para actualizar
    const datosActualizacion = {}

    // Campos de texto
    if (datos.marca !== undefined) datosActualizacion.marca = datos.marca.trim()
    if (datos.modelo !== undefined) datosActualizacion.modelo = datos.modelo.trim()
    if (datos.color !== undefined) datosActualizacion.color = datos.color.trim()
    if (datos.motor !== undefined) datosActualizacion.motor = datos.motor?.trim() || null
    if (datos.descripcion !== undefined) datosActualizacion.descripcion = datos.descripcion?.trim() || null

    // Campos numéricos
    if (datos.anio !== undefined) datosActualizacion.anio = Number(datos.anio)
    if (datos.precio !== undefined) datosActualizacion.precio = Number(datos.precio)
    if (datos.kilometraje !== undefined) datosActualizacion.kilometraje = Number(datos.kilometraje)
    if (datos.puertas !== undefined) datosActualizacion.puertas = Number(datos.puertas)

    // Enums
    if (datos.combustible !== undefined) datosActualizacion.combustible = datos.combustible
    if (datos.transmision !== undefined) datosActualizacion.transmision = datos.transmision
    if (datos.estado !== undefined) datosActualizacion.estado = datos.estado

    // Booleanos
    if (datos.destacado !== undefined) datosActualizacion.destacado = Boolean(datos.destacado)

    // Actualizar vehículo
    const vehiculoActualizado = await prisma.vehiculo.update({
      where: { id },
      data: datosActualizacion,
      include: {
        imagenes: {
          orderBy: { orden: "asc" }
        },
        caracteristicas: true
      }
    })

    console.log(`✅ Vehículo ${id} actualizado exitosamente`)

    return Response.json({
      success: true,
      vehiculo: formatearVehiculo(vehiculoActualizado),
      mensaje: "Vehículo actualizado exitosamente"
    })

  } catch (error) {
    console.error("❌ Error en PUT:", error)

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/* ========================================
   DELETE - Eliminar un vehículo
======================================== */
export async function DELETE(request) {
  try {
    const id = extraerIdDeUrl(request)

    if (!id) {
      return Response.json(
        { success: false, error: "ID no proporcionado" },
        { status: 400 }
      )
    }

    // Verificar que el vehículo existe
    const vehiculoExistente = await prisma.vehiculo.findUnique({
      where: { id },
      include: {
        imagenes: true,
        caracteristicas: true,
        consultas: true
      }
    })

    if (!vehiculoExistente) {
      return Response.json(
        { success: false, error: "Vehículo no encontrado" },
        { status: 404 }
      )
    }

    // Eliminar vehículo (las imágenes y características se eliminan automáticamente por CASCADE)
    await prisma.vehiculo.delete({
      where: { id }
    })

    console.log(`🗑️  Vehículo ${id} eliminado exitosamente`)

    return Response.json({
      success: true,
      mensaje: "Vehículo eliminado exitosamente",
      vehiculoEliminado: {
        id: vehiculoExistente.id,
        marca: vehiculoExistente.marca,
        modelo: vehiculoExistente.modelo
      }
    })

  } catch (error) {
    console.error("❌ Error en DELETE:", error)

    // Error específico si hay consultas relacionadas
    if (error.code === 'P2003') {
      return Response.json(
        { 
          success: false, 
          error: "No se puede eliminar el vehículo porque tiene consultas asociadas" 
        },
        { status: 409 }
      )
    }

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}