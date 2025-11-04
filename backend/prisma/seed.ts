import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.upsert({
    where: { email: "admin@petshop.com" },
    update: {},
    create: {
      email: "admin@petshop.com",
      password: await bcrypt.hash("admin123", 10),
    },
  });

  const products = [
    {
      name: "Ração Premium para Cães",
      price: 89.90,
      stock: 50,
      description: "Ração completa e balanceada para cães adultos",
    },
    {
      name: "Ração Premium para Gatos",
      price: 79.90,
      stock: 45,
      description: "Ração completa e balanceada para gatos adultos",
    },
    {
      name: "Brinquedo para Cães",
      price: 25.00,
      stock: 30,
      description: "Brinquedo interativo resistente",
    },
    {
      name: "Areia Sanitária",
      price: 35.00,
      stock: 60,
      description: "Areia higiênica para gatos",
    },
    {
      name: "Coleira com Guia",
      price: 45.00,
      stock: 25,
      description: "Coleira ajustável com guia retrátil",
    },
    {
      name: "Shampoo para Cães",
      price: 32.00,
      stock: 40,
      description: "Shampoo hipoalergênico para cães",
    },
    {
      name: "Cama para Pet",
      price: 120.00,
      stock: 15,
      description: "Cama confortável e macia",
    },
    {
      name: "Comedouro Automático",
      price: 180.00,
      stock: 10,
      description: "Comedouro com timer automático",
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!existing) {
      await prisma.product.create({
        data: product,
      });
    }
  }

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

