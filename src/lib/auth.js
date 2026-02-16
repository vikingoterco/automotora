// src/lib/auth.js

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

/* ========================================
   CONFIGURACIÓN
======================================== */

// En producción, esto debe estar en .env
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambialo-en-produccion'
const SALT_ROUNDS = 10

/* ========================================
   FUNCIONES DE HASHING
======================================== */

/**
 * Hashear una contraseña
 */
export async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    return hash
  } catch (error) {
    console.error('❌ Error al hashear contraseña:', error)
    throw new Error('Error al procesar la contraseña')
  }
}

/**
 * Comparar contraseña con hash
 */
export async function comparePassword(password, hash) {
  try {
    const match = await bcrypt.compare(password, hash)
    return match
  } catch (error) {
    console.error('❌ Error al comparar contraseña:', error)
    throw new Error('Error al verificar la contraseña')
  }
}

/* ========================================
   FUNCIONES DE JWT
======================================== */

/**
 * Generar token JWT
 */
export function generateToken(payload) {
  try {
    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { 
        expiresIn: '7d' // Token válido por 7 días
      }
    )
    return token
  } catch (error) {
    console.error('❌ Error al generar token:', error)
    throw new Error('Error al generar token de autenticación')
  }
}

/**
 * Verificar token JWT
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado')
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido')
    }
    throw new Error('Error al verificar token')
  }
}

/**
 * Extraer token del header Authorization
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7) // Remueve "Bearer "
}
