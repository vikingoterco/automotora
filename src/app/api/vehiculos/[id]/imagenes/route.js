// src/app/api/vehiculos/[id]/imagenes/route.js

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export async function POST(request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    try {
      verifyToken(token)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Extraer ID de diferentes formas
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 2] // El ID está antes de /imagenes
    
    console.log('🔍 URL completa:', request.url)
    console.log('🔍 Path:', url.pathname)
    console.log('🔍 Parts:', pathParts)
    console.log('📍 ID extraído:', id)

    const body = await request.json()
    const { imagenes } = body

    console.log('📦 Body recibido:', body)
    console.log('🖼️ Imágenes:', imagenes)

    if (!imagenes || !Array.isArray(imagenes)) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    if (!id || id === 'imagenes') {
      return NextResponse.json(
        { success: false, error: 'ID de vehículo inválido' },
        { status: 400 }
      )
    }

    // Verificar que el vehículo existe
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id }
    })

    if (!vehiculo) {
      return NextResponse.json(
        { success: false, error: 'Vehículo no encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ Vehículo encontrado:', vehiculo.marca, vehiculo.modelo)

    // Crear las imágenes una por una con logs
    const imagenesCreadas = []
    for (const img of imagenes) {
      console.log('➕ Creando imagen:', img)
      const imagenCreada = await prisma.imagen.create({
        data: {
          url: img.url,
          orden: img.orden,
          vehiculoId: id
        }
      })
      imagenesCreadas.push(imagenCreada)
      console.log('✅ Imagen creada:', imagenCreada.id)
    }

    console.log(`✅ ${imagenesCreadas.length} imágenes agregadas al vehículo ${id}`)

    return NextResponse.json({
      success: true,
      imagenes: imagenesCreadas,
      count: imagenesCreadas.length
    })

  } catch (error) {
    console.error('❌ Error completo:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}