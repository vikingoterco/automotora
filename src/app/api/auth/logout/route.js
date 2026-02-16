// src/app/api/auth/logout/route.js

export async function POST(request) {
  try {
    // En una aplicación con tokens JWT, el logout es principalmente del lado del cliente
    // El cliente debe eliminar el token guardado (localStorage, cookie, etc.)
    
    // Aquí podríamos agregar lógica adicional como:
    // - Registrar el logout en logs
    // - Invalidar el token en una blacklist (si se implementa)
    // - Actualizar última actividad del usuario

    console.log('🚪 Usuario cerró sesión')

    return Response.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en logout:', error)

    return Response.json(
      { 
        success: false, 
        error: 'Error al cerrar sesión' 
      },
      { status: 500 }
    )
  }
}
