import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('senha123', 10);

  const usuario = await prisma.usuario.upsert({
    where: { email: 'demo@copix.local' },
    update: {},
    create: {
      nome: 'Operador Demo',
      email: 'demo@copix.local',
      senhaHash,
    },
  });

  const organizacao = await prisma.organizacao.upsert({
    where: { documento: '12345678000199' },
    update: {},
    create: {
      nome: 'Mercado Demo LTDA',
      documento: '12345678000199',
      membros: {
        create: {
          usuarioId: usuario.id,
          papel: 'ADMIN',
        },
      },
      provedores: {
        create: {
          nome: 'Simulador Pix Copix',
          tipo: 'SIMULADOR',
          chaveWebhook: randomBytes(24).toString('hex'),
        },
      },
    },
    include: { provedores: true },
  });

  const cobrancaExistente = await prisma.cobranca.findFirst({
    where: { organizacaoId: organizacao.id, descricao: 'Pedido demo #1001' },
  });

  if (!cobrancaExistente) {
    await prisma.cobranca.create({
      data: {
        organizacaoId: organizacao.id,
        txid: `copixdemo${randomBytes(10).toString('hex')}`.slice(0, 35),
        valorCentavos: 15990,
        descricao: 'Pedido demo #1001',
        vencimentoEm: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  }

  console.log('Seed ok');
  console.log('Login: demo@copix.local / senha123');
  console.log(`Organização: ${organizacao.nome} (${organizacao.id})`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
