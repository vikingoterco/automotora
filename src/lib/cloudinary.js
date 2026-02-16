// src/lib/cloudinary.js

import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * Subir imagen a Cloudinary
 */
export async function uploadImage(base64Image, folder = 'automotora') {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 900, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    }
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error)
    throw new Error('Error al subir la imagen')
  }
}

/**
 * Eliminar imagen de Cloudinary
 */
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('❌ Error eliminando imagen:', error)
    throw new Error('Error al eliminar la imagen')
  }
}

export default cloudinary
