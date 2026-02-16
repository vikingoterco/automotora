// src/app/api/consultas/route.js

import prisma from '../../../lib/prisma.js'

/* ========================================
   FUNCIONES AUXILIARES
======================================== */

const estadosValidos = ["PENDIENTE", "CONTACTADO", "CERRADO"]

function validarConsulta(datos) {
  const { nombre, email, telefono, mensaje } = datos
  const errores = []

  if (!nombre?.trim()) {
    errores.push("El nombre es obligatorio")
  }

  if (!email?.trim()) {
    errores.push("El email es obligatorio")
  } else {
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errores.push("El email no es válido")
    }
  }

  if (!telefono?.trim()) {
    errores.push("El teléfono es obligatorio")
  }

  if (!mensaje?.trim()) {
    errores.push("El mensaje es obligatorio")
  } else if (mensaje.trim().length < 10) {
    errores.push("El mensaje debe tener al menos 10 caracteres")
  }

  return errores.length > 0 ? errores : null
}

/* ========================================
   GET - Obtener todas las consultas
======================================== */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const vehiculoId = searchParams.get('vehiculoId')

    // Construir filtros
    const where = {}
    
    if (estado && estadosValidos.includes(estado)) {
      where.estado = estado
    }
    
    if (vehiculoId) {
      where.vehiculoId = vehiculoId
    }

    const consultas = await prisma.consulta.findMany({
      where,
      include: {
        vehiculo: {
          select: {
            id: true,
            marca: true,
            modelo: true,
            anio: true,
            precio: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Más recientes primero
      }
    })

    return Response.json({
      success: true,
      count: consultas.length,
      consultas: consultas
    })

  } catch (error) {
    console.error("❌ Error en GET consultas:", error)

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/* ========================================
   POST - Crear nueva consulta
======================================== */
export async function POST(request) {
  try {
    const datos = await request.json()

    // Validar datos
    const erroresValidacion = validarConsulta(datos)
    if (erroresValidacion) {
      return Response.json(
        { success: false, errors: erroresValidacion },
        { status: 400 }
      )
    }

    // Si se proporciona vehiculoId, verificar que existe
    if (datos.vehiculoId) {
      const vehiculoExiste = await prisma.vehiculo.findUnique({
        where: { id: datos.vehiculoId }
      })

      if (!vehiculoExiste) {
        return Response.json(
          { success: false, error: "El vehículo especificado no existe" },
          { status: 404 }
        )
      }
    }

    // Crear consulta
    const nuevaConsulta = await prisma.consulta.create({
      data: {
        nombre: datos.nombre.trim(),
        email: datos.email.trim().toLowerCase(),
        telefono: datos.telefono.trim(),
        mensaje: datos.mensaje.trim(),
        vehiculoId: datos.vehiculoId || null,
        estado: 'PENDIENTE'
      },
      include: {
        vehiculo: {
          select: {
            id: true,
            marca: true,
            modelo: true,
            anio: true
          }
        }
      }
    })

    console.log(`✅ Nueva consulta recibida de ${nuevaConsulta.nombre}`)

    return Response.json(
      {
        success: true,
        consulta: nuevaConsulta,
        mensaje: "Consulta enviada exitosamente. Nos pondremos en contacto pronto."
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("❌ Error en POST consulta:", error)

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
