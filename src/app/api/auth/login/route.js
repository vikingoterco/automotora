// src/app/api/auth/login/route.js

import prisma from '../../../../lib/prisma.js'
import { comparePassword, generateToken } from '../../../../lib/auth.js'

/* ========================================
   POST - Login de usuario
======================================== */
export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validar que se proporcionaron email y contraseña
    if (!email || !password) {
      return Response.json(
        { 
          success: false, 
          error: 'Email y contraseña son requeridos' 
        },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    // Si no existe el usuario
    if (!usuario) {
      return Response.json(
        { 
          success: false, 
          error: 'Credenciales inválidas' 
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario está activo
    if (!usuario.activo) {
      return Response.json(
        { 
          success: false, 
          error: 'Usuario desactivado. Contacte al administrador.' 
        },
        { status: 403 }
      )
    }

    // Comparar contraseña
    const passwordValida = await comparePassword(password, usuario.password)

    if (!passwordValida) {
      return Response.json(
        { 
          success: false, 
          error: 'Credenciales inválidas' 
        },
        { status: 401 }
      )
    }

    // Generar token JWT
    const token = generateToken({
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    })

    // Datos del usuario (sin contraseña)
    const usuarioSinPassword = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      activo: usuario.activo
    }

    console.log(`✅ Login exitoso: ${usuario.email}`)

    // Respuesta exitosa
    return Response.json({
      success: true,
      message: 'Login exitoso',
      token: token,
      usuario: usuarioSinPassword
    })

  } catch (error) {
    console.error('❌ Error en login:', error)

    return Response.json(
      { 
        success: false, 
        error: 'Error en el servidor' 
      },
      { status: 500 }
    )
  }
}
