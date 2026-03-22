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

  /* =========================
   * CAMPEONATOS FEBAD
   * ========================= */

  const admin = await prisma.user.findUnique({
    where: { email: 'benji@gmail.com' },
  });

  if (!admin) {
    throw new Error('Usuario admin no encontrado para seed de campeonatos');
  }

  /* =========================
   * FEDERACION
   * ========================= */
  const febad = await prisma.federation.upsert({
    where: { acronym: 'FEBAD' },
    update: {},
    create: {
      name: 'Federación Boliviana de Automovilismo Deportivo',
      acronym: 'FEBAD',
      country: 'Bolivia',
      status: 'ACTIVE',
      createdById: admin.id,
    },
  });

  /* =========================
   * ASOCIACIONES
   * ========================= */
  const associationsData = [
    'Potosí',
    'La Paz',
    'Sucre',
    'Oruro',
    'Tarija',
    'Cochabamba',
    'Santa Cruz',
  ];

  const associations: Record<string, any> = {};

  for (const dept of associationsData) {
    associations[dept] = await prisma.departmentAssociation.upsert({
      where: {
        federationId_name: {
          federationId: febad.id,
          name: `Asociación Departamental de Automovilismo ${dept}`,
        },
      },
      update: {},
      create: {
        federationId: febad.id,
        name: `Asociación Departamental de Automovilismo ${dept}`,
        department: dept,
        status: 'ACTIVE',
        createdById: admin.id,
      },
    });
  }

  /* =========================
   * CAMPEONATOS
   * ========================= */
  const circuitChampionship = await prisma.championship.upsert({
    where: {
      federationId_name_season: {
        federationId: febad.id,
        name: 'Campeonato de Circuitos Kenny Prieto Melgarejo',
        season: 2025,
      },
    },
    update: {},
    create: {
      federationId: febad.id,
      name: 'Campeonato de Circuitos Kenny Prieto Melgarejo',
      modality: 'CIRCUITO',
      season: 2025,
      status: 'PLANNED',
      createdById: admin.id,
    },
  });

  const rallyChampionship = await prisma.championship.upsert({
    where: {
      federationId_name_season: {
        federationId: febad.id,
        name: 'Campeonato de Rally Carlos Zenteno Pareja',
        season: 2025,
      },
    },
    update: {},
    create: {
      federationId: febad.id,
      name: 'Campeonato de Rally Carlos Zenteno Pareja',
      modality: 'RALLY',
      season: 2025,
      status: 'PLANNED',
      createdById: admin.id,
    },
  });

  /* =========================
   * CALENDARIO – CIRCUITO
   * ========================= */
  const circuitDates = [
    {
      round: 1,
      dept: 'Potosí',
      name: 'Montaña de Plata Potosí',
      start: '2025-04-03',
      end: '2025-04-05',
    },
    {
      round: 2,
      dept: 'La Paz',
      name: 'Circuito La Paz',
      start: '2025-05-01',
      end: '2025-05-03',
    },
    {
      round: 3,
      dept: 'Sucre',
      name: 'Circuito Oscar Crespo Sucre',
      start: '2025-05-29',
      end: '2025-05-31',
    },
    {
      round: 4,
      dept: 'Oruro',
      name: 'Circuito Mario Mercado Vaca Guzmán',
      start: '2025-09-11',
      end: '2025-09-13',
    },
  ];

  for (const d of circuitDates) {
    await prisma.championshipCalendar.upsert({
      where: {
        championshipId_roundNumber: {
          championshipId: circuitChampionship.id,
          roundNumber: d.round,
        },
      },
      update: {},
      create: {
        championshipId: circuitChampionship.id,
        associationId: associations[d.dept].id,
        roundNumber: d.round,
        eventName: d.name,
        startDate: new Date(d.start),
        endDate: new Date(d.end),
        status: 'SCHEDULED',
        createdById: admin.id,
      },
    });
  }

  /* =========================
   * CALENDARIO – RALLY
   * ========================= */
  const rallyDates = [
    {
      round: 1,
      dept: 'Tarija',
      name: 'Rally Andaluz',
      start: '2025-03-05',
      end: '2025-03-08',
    },
    {
      round: 2,
      dept: 'Cochabamba',
      name: 'Rally de la Concordia',
      start: '2025-06-25',
      end: '2025-06-28',
    },
    {
      round: 3,
      dept: 'Sucre',
      name: 'Rally Capital Codasur',
      start: '2025-07-23',
      end: '2025-07-26',
    },
    {
      round: 4,
      dept: 'Santa Cruz',
      name: 'Rally Concepción',
      start: '2025-08-13',
      end: '2025-08-16',
    },
  ];

  for (const d of rallyDates) {
    await prisma.championshipCalendar.upsert({
      where: {
        championshipId_roundNumber: {
          championshipId: rallyChampionship.id,
          roundNumber: d.round,
        },
      },
      update: {},
      create: {
        championshipId: rallyChampionship.id,
        associationId: associations[d.dept].id,
        roundNumber: d.round,
        eventName: d.name,
        startDate: new Date(d.start),
        endDate: new Date(d.end),
        status: 'SCHEDULED',
        createdById: admin.id,
      },
    });
  }

  /* =========================
   * CATEGORIA PROMOCIONAL + 20 TEAMS TEST
   * ========================= */
  let promotionalCategory = await prisma.category.findFirst({
    where: {
      championshipId: rallyChampionship.id,
      name: 'PROMOCIONAL',
    },
  });

  if (!promotionalCategory) {
    promotionalCategory = await prisma.category.create({
      data: {
        championshipId: rallyChampionship.id,
        name: 'PROMOCIONAL',
        modality: 'RALLY',
        allowsCodriver: true,
        pointsApply: true,
        createdById: admin.id,
      },
    });
  }

  for (let i = 1; i <= 20; i++) {
    const index = String(i).padStart(2, '0');

    const driver = await prisma.driver.upsert({
      where: {
        email: `promocional.driver.${index}@test.local`,
      },
      update: {
        firstName: `Piloto${index}`,
        lastName: 'Promocional',
        status: 'ACTIVE',
      },
      create: {
        firstName: `Piloto${index}`,
        lastName: 'Promocional',
        documentType: 'CI',
        documentNumber: `PROMO-DRV-${index}`,
        licenseNumber: `PROMO-LIC-DRV-${index}`,
        nationality: 'Boliviana',
        email: `promocional.driver.${index}@test.local`,
        status: 'ACTIVE',
        createdById: admin.id,
      },
    });

    const codriver = await prisma.driver.upsert({
      where: {
        email: `promocional.codriver.${index}@test.local`,
      },
      update: {
        firstName: `Copiloto${index}`,
        lastName: 'Promocional',
        status: 'ACTIVE',
      },
      create: {
        firstName: `Copiloto${index}`,
        lastName: 'Promocional',
        documentType: 'CI',
        documentNumber: `PROMO-COD-${index}`,
        licenseNumber: `PROMO-LIC-COD-${index}`,
        nationality: 'Boliviana',
        email: `promocional.codriver.${index}@test.local`,
        status: 'ACTIVE',
        createdById: admin.id,
      },
    });

    const competitionNo = 9000 + i;
    const existingTeam = await prisma.team.findFirst({
      where: {
        championshipId: rallyChampionship.id,
        competitionNo,
      },
    });

    if (!existingTeam) {
      await (prisma.team as any).create({
        data: {
          championshipId: rallyChampionship.id,
          categoryId: promotionalCategory.id,
          driverId: driver.id,
          codriverId: codriver.id,
          competitionNo,
          carBrand: 'TEST',
          carModel: `PROMOCIONAL-${index}`,
          carYear: 2020 + (i % 5),
          status: 'INSCRIBED',
          createdById: admin.id,
        },
      });
    }
  }

  console.log('✅ Categoría PROMOCIONAL y 20 teams de prueba asegurados');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
