// src/app/api/vehiculos/route.js

import prisma from '../../../lib/prisma.js'

/* ========================================
   FUNCIONES AUXILIARES
======================================== */

// Validar enums contra el schema
const combustiblesValidos = ["NAFTA", "DIESEL", "ELECTRICO", "HIBRIDO", "GNC"]
const transmisionesValidas = ["MANUAL", "AUTOMATICA", "SECUENCIAL"]

function validarVehiculo(data) {
  const {
    marca,
    modelo,
    anio,
    precio,
    kilometraje,
    combustible,
    transmision,
    color,
    puertas
  } = data

  if (!marca?.trim()) return "La marca es obligatoria"
  if (!modelo?.trim()) return "El modelo es obligatorio"
  if (!color?.trim()) return "El color es obligatorio"

  if (!anio || anio < 1900 || anio > new Date().getFullYear() + 1)
    return "Año inválido"

  if (!precio || precio <= 0)
    return "Precio inválido"

  if (kilometraje < 0)
    return "Kilometraje inválido"

  if (!puertas || puertas <= 0)
    return "Cantidad de puertas inválida"

  if (!combustiblesValidos.includes(combustible))
    return "Tipo de combustible inválido"

  if (!transmisionesValidas.includes(transmision))
    return "Tipo de transmisión inválida"

  return null
}

// Transformar Decimal a Number
function formatearVehiculo(vehiculo) {
  return {
    ...vehiculo,
    precio: Number(vehiculo.precio)
  }
}

/* ========================================
   GET - Obtener todos los vehículos
======================================== */
export async function GET() {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      include: {
        imagenes: {
          orderBy: { orden: "asc" }
        },
        caracteristicas: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return Response.json({
      success: true,
      count: vehiculos.length,
      vehiculos: vehiculos.map(formatearVehiculo)
    })

  } catch (error) {
    console.error("Error en GET:", error)

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/* ========================================
   POST - Crear nuevo vehículo
======================================== */
export async function POST(request) {
  try {
    const datos = await request.json()

    // Normalizar números
    datos.anio = Number(datos.anio)
    datos.precio = Number(datos.precio)
    datos.kilometraje = Number(datos.kilometraje)
    datos.puertas = Number(datos.puertas)

    // Validación profesional
    const errorValidacion = validarVehiculo(datos)
    if (errorValidacion) {
      return Response.json(
        { success: false, error: errorValidacion },
        { status: 400 }
      )
    }

    const nuevoVehiculo = await prisma.vehiculo.create({
      data: {
        marca: datos.marca.trim(),
        modelo: datos.modelo.trim(),
        anio: datos.anio,
        precio: datos.precio,
        kilometraje: datos.kilometraje,
        combustible: datos.combustible,
        transmision: datos.transmision,
        color: datos.color.trim(),
        puertas: datos.puertas,
        motor: datos.motor || null,
        descripcion: datos.descripcion || null,
        destacado: datos.destacado ?? false,

        imagenes: datos.imagenes?.length
          ? {
              create: datos.imagenes.map((img, index) => ({
                url: img.url,
                orden: index
              }))
            }
          : undefined,

        caracteristicas: datos.caracteristicas?.length
          ? {
              create: datos.caracteristicas.map((c) => ({
                nombre: c.nombre
              }))
            }
          : undefined
      },
      include: {
        imagenes: true,
        caracteristicas: true
      }
    })

    return Response.json(
      {
        success: true,
        vehiculo: formatearVehiculo(nuevoVehiculo)
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error en POST:", error)

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
