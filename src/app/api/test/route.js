// src/app/api/test/route.js

export async function GET(request) {
  return Response.json({ 
    message: 'API funcionando correctamente! 🚀',
    timestamp: new Date().toISOString(),
    status: 'OK'
  })
}