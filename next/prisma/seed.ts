import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user (reza@4401.earth)
  const adminUser = await prisma.user.upsert({
    where: { email: 'reza@4401.earth' },
    update: {},
    create: {
      email: 'reza@4401.earth',
      name: 'Reza Admin',
      role: 'sys_admin',
    },
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create example admin user for development
  const exampleAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Example Admin',
      role: 'sys_admin',
    },
  })

  console.log('✅ Created example admin user:', exampleAdmin.email)

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Tech Corp',
        status: 'ACTIVE',
        source: 'Website',
        tags: ['premium', 'enterprise'],
        createdBy: adminUser.id,
      },
    }),
    prisma.customer.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'Design Studio',
        status: 'LEAD',
        source: 'Referral',
        tags: ['design', 'startup'],
        createdBy: adminUser.id,
      },
    }),
  ])

  console.log('✅ Created customers:', customers.length)

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'product-1' },
      update: {},
      create: {
        id: 'product-1',
        name: 'CRM Pro License',
        description: 'Professional CRM license with advanced features',
        price: 99.99,
        category: 'Software',
        status: 'PUBLISHED',
        tags: ['software', 'business'],
        createdBy: adminUser.id,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-2' },
      update: {},
      create: {
        id: 'product-2',
        name: 'CRM Enterprise License',
        description: 'Enterprise CRM license with premium support',
        price: 299.99,
        category: 'Software',
        status: 'PUBLISHED',
        tags: ['software', 'enterprise'],
        createdBy: adminUser.id,
      },
    }),
  ])

  console.log('✅ Created products:', products.length)

  // Create sample order
  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-001',
      total: 99.99,
      status: 'CONFIRMED',
      customerId: customers[0].id,
      items: {
        create: [
          {
            quantity: 1,
            price: 99.99,
            productId: products[0].id,
          },
        ],
      },
    },
  })

  console.log('✅ Created order:', order.orderNumber)

  // Create sample activities
  await prisma.activity.createMany({
    data: [
      {
        type: 'WEBSITE_VISIT',
        description: 'Visited pricing page',
        customerId: customers[0].id,
        metadata: { page: '/pricing', duration: 120 },
      },
      {
        type: 'PURCHASE',
        description: 'Purchased CRM Pro License',
        customerId: customers[0].id,
        metadata: { orderId: order.id, amount: 99.99 },
      },
      {
        type: 'EMAIL_OPEN',
        description: 'Opened welcome email',
        customerId: customers[1].id,
        metadata: { emailId: 'welcome-001', subject: 'Welcome to CRM' },
      },
    ],
  })

  console.log('✅ Created sample activities')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 