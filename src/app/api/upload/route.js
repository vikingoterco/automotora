// src/app/api/upload/route.js

import { uploadImage } from '../../../lib/cloudinary.js'

export async function POST(request) {
  try {
    const { images } = await request.json()

    // Validar que se enviaron imágenes
    if (!images || !Array.isArray(images) || images.length === 0) {
      return Response.json(
        { success: false, error: 'No se proporcionaron imágenes' },
        { status: 400 }
      )
    }

    // Validar cantidad máxima (10 imágenes por request)
    if (images.length > 10) {
      return Response.json(
        { success: false, error: 'Máximo 10 imágenes por vez' },
        { status: 400 }
      )
    }

    // Subir todas las imágenes
    const uploadPromises = images.map(async (imageData) => {
      // Validar que es base64
      if (!imageData.startsWith('data:image/')) {
        throw new Error('Formato de imagen inválido')
      }

      return await uploadImage(imageData, 'automotora/vehiculos')
    })

    const uploadedImages = await Promise.all(uploadPromises)

    console.log(`✅ ${uploadedImages.length} imágenes subidas exitosamente`)

    return Response.json({
      success: true,
      images: uploadedImages,
      count: uploadedImages.length
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error en upload:', error)

    return Response.json(
      { 
        success: false, 
        error: error.message || 'Error al subir imágenes' 
      },
      { status: 500 }
    )
  }
}
