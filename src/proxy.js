// src/middleware.js

import { NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from './lib/auth.js'

/* ========================================
   RUTAS PROTEGIDAS
======================================== */

// Rutas que requieren autenticación
const RUTAS_PROTEGIDAS = [
  '/api/vehiculos', // POST, PUT, DELETE (GET es público)
  '/api/consultas', // Todas las operaciones (admin)
]

// Métodos que requieren autenticación por ruta
const METODOS_PROTEGIDOS = {
  '/api/vehiculos': ['POST', 'PUT', 'DELETE'],
  '/api/consultas': ['GET', 'PUT', 'DELETE'], // POST es público (clientes)
}

/* ========================================
   MIDDLEWARE
======================================== */

export default function proxy(request) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Verificar si la ruta necesita protección
  const rutaProtegida = RUTAS_PROTEGIDAS.find(ruta => pathname.startsWith(ruta))
  
  if (!rutaProtegida) {
    // Ruta no protegida, continuar
    return NextResponse.next()
  }

  // Verificar si el método específico necesita autenticación
  const metodosProtegidos = METODOS_PROTEGIDOS[rutaProtegida]
  if (metodosProtegidos && !metodosProtegidos.includes(method)) {
    // Método no protegido en esta ruta, continuar
    return NextResponse.next()
  }

  // Extraer token del header Authorization
  const authHeader = request.headers.get('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'No autorizado. Token requerido.' 
      },
      { status: 401 }
    )
  }

  // Verificar token
  try {
    const decoded = verifyToken(token)
    
    // Token válido, agregar info del usuario al request
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('X-User-Id', decoded.userId)
    requestHeaders.set('X-User-Email', decoded.email)
    requestHeaders.set('X-User-Rol', decoded.rol)

    console.log(`✅ Usuario autenticado: ${decoded.email} (${decoded.rol})`)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('❌ Error al verificar token:', error.message)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Token inválido' 
      },
      { status: 401 }
    )
  }
}

/* ========================================
   CONFIGURACIÓN
======================================== */

export const config = {
  matcher: [
    '/api/vehiculos/:path*',
    '/api/consultas/:path*',
  ]
}
