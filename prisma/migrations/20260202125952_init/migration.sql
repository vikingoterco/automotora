-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "TipoCombustible" AS ENUM ('NAFTA', 'DIESEL', 'ELECTRICO', 'HIBRIDO', 'GNC');

-- CreateEnum
CREATE TYPE "TipoTransmision" AS ENUM ('MANUAL', 'AUTOMATICA', 'SECUENCIAL');

-- CreateEnum
CREATE TYPE "EstadoVehiculo" AS ENUM ('DISPONIBLE', 'RESERVADO', 'VENDIDO');

-- CreateEnum
CREATE TYPE "EstadoConsulta" AS ENUM ('PENDIENTE', 'CONTACTADO', 'CERRADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'VENDEDOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "kilometraje" INTEGER NOT NULL,
    "combustible" "TipoCombustible" NOT NULL,
    "transmision" "TipoTransmision" NOT NULL,
    "color" TEXT NOT NULL,
    "puertas" INTEGER NOT NULL,
    "motor" TEXT,
    "descripcion" TEXT,
    "estado" "EstadoVehiculo" NOT NULL DEFAULT 'DISPONIBLE',
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imagen" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Imagen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caracteristica" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,

    CONSTRAINT "Caracteristica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "vehiculoId" TEXT,
    "estado" "EstadoConsulta" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Imagen" ADD CONSTRAINT "Imagen_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caracteristica" ADD CONSTRAINT "Caracteristica_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
