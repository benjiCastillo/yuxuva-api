import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  /* =========================
   * 1. ROLES BASE
   * ========================= */
  const roles = [
    {
      code: 'ADMIN',
      name: 'Administrador',
      description: 'Control total del sistema',
      isSystem: true,
    },
    {
      code: 'ORGANIZADOR',
      name: 'Organizador',
      description: 'Gestión de campeonatos y fechas',
      isSystem: true,
    },
    {
      code: 'CRONOMETRAJE',
      name: 'Cronometraje',
      description: 'Registro de tiempos',
      isSystem: true,
    },
    {
      code: 'CONSULTA',
      name: 'Consulta',
      description: 'Solo lectura',
      isSystem: true,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }

  console.log('✅ Roles creados');

  /* =========================
   * 2. USUARIO ADMIN
   * ========================= */
  const adminEmail = 'benji@gmail.com';
  const adminPassword = 'benji100'; // ⚠️ solo dev

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Benji Castillo Eguez',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  console.log('✅ Usuario admin creado');

  /* =========================
   * 3. ASIGNAR ROL ADMIN
   * ========================= */
  const adminRole = await prisma.role.findUnique({
    where: { code: 'ADMIN' },
  });

  if (!adminRole) {
    throw new Error('Rol ADMIN no encontrado');
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Rol ADMIN asignado');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
