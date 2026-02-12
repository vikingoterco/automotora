const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {

  // Agregar imagen al primer vehículo

  const imagen = await prisma.imagen.create({

    data: {

      url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',

      vehiculoId: 'cmljkgg100001b9c92w7yjtue', // ← CAMBIAR POR TU ID

      orden: 0

    }

  })

  

  console.log('✅ Imagen agregada:', imagen)

  

  // Agregar características también

  const caracteristica1 = await prisma.caracteristica.create({

    data: {

      nombre: 'ABS',

      vehiculoId: cmljkgg100001b9c92w7yjtue

    }

  })

  

  const caracteristica2 = await prisma.caracteristica.create({

    data: {

      nombre: 'Aire acondicionado',

      vehiculoId: 'cmljkgg100001b9c92w7yjtue' // ← EL MISMO ID

    }

  })

  

  console.log('✅ Características agregadas')

}

main()

  .catch(console.error)

  .finally(() => prisma.$disconnect())
