// src/app/api/vehiculos/[id]/imagenes/[imagenId]/route.js

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { deleteImage } from '@/lib/cloudinary'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

/**
 * DELETE /api/vehiculos/[id]/imagenes/[imagenId]
 * Eliminar una imagen específica de un vehículo
 * 
 * Requiere: Autenticación (ADMIN o VENDEDOR)
 * 
 * Proceso:
 * 1. Verificar autenticación
 * 2. Validar que la imagen existe
 * 3. Validar que pertenece al vehículo correcto
 * 4. Eliminar de Cloudinary
 * 5. Eliminar de la base de datos
 */
export async function DELETE(request, { params }) {
  try {
    // 1. Verificar autenticación
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

    // 2. Obtener parámetros
    const { id: vehiculoId, imagenId } = params

    if (!vehiculoId || !imagenId) {
      return NextResponse.json(
        { success: false, error: 'Parámetros inválidos' },
        { status: 400 }
      )
    }

    // 3. Verificar que el vehículo existe
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
      include: { imagenes: true }
    })

    if (!vehiculo) {
      return NextResponse.json(
        { success: false, error: 'Vehículo no encontrado' },
        { status: 404 }
      )
    }

    // 4. Buscar la imagen
    const imagen = await prisma.imagen.findUnique({
      where: { id: imagenId }
    })

    if (!imagen) {
      return NextResponse.json(
        { success: false, error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    // 5. Verificar que la imagen pertenece al vehículo correcto
    if (imagen.vehiculoId !== vehiculoId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La imagen no pertenece a este vehículo' 
        },
        { status: 400 }
      )
    }

    // 6. Prevenir eliminar la última imagen (opcional - puedes comentar esto)
    if (vehiculo.imagenes.length === 1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No podés eliminar la última imagen del vehículo' 
        },
        { status: 400 }
      )
    }

    // 7. Extraer el publicId de Cloudinary de la URL
    // URL formato: https://res.cloudinary.com/xxx/image/upload/v123/automotora/abc123.jpg
    let publicId = null
    try {
      const urlParts = imagen.url.split('/')
      const uploadIndex = urlParts.findIndex(part => part === 'upload')
      
      if (uploadIndex !== -1) {
        // Obtener todo después de /upload/vXXX/
        const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/')
        // Remover extensión
        publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.'))
      }
    } catch (parseError) {
      console.warn('⚠️ No se pudo parsear URL de Cloudinary:', parseError)
    }

    // 8. Intentar eliminar de Cloudinary
    if (publicId) {
      try {
        await deleteImage(publicId)
        console.log('✅ Imagen eliminada de Cloudinary:', publicId)
      } catch (cloudinaryError) {
        console.error('⚠️ Error al eliminar de Cloudinary:', cloudinaryError)
        // Continuar aunque falle Cloudinary (la imagen en BD se elimina igual)
      }
    }

    // 9. Eliminar de la base de datos
    await prisma.imagen.delete({
      where: { id: imagenId }
    })

    console.log(`✅ Imagen ${imagenId} eliminada del vehículo ${vehiculoId}`)

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada exitosamente',
      imagenesRestantes: vehiculo.imagenes.length - 1
    })

  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}