// Sample data seeding script for PostgreSQL with Sequelize
// Run this file with: node backend/seedData.js

require('dotenv').config();
const { sequelize, User, Product, Order, OrderItem } = require('./models');

// Sample products data
const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Perfect for music lovers and professionals.',
    price: 6799,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    stock: 50,
    rating: 4.5,
    reviews: 128,
    featured: true
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track your fitness goals with this advanced smartwatch. Heart rate monitoring, GPS, and water-resistant.',
    price: 12749,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    stock: 30,
    rating: 4.7,
    reviews: 95,
    featured: true
  },
  {
    name: 'Laptop Backpack',
    description: 'Durable and stylish backpack with dedicated laptop compartment. Water-resistant material.',
    price: 4249,
    category: 'Other',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
    stock: 75,
    rating: 4.3,
    reviews: 62
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB mechanical keyboard with customizable keys. Perfect for gaming and typing enthusiasts.',
    price: 7649,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop',
    stock: 40,
    rating: 4.6,
    reviews: 87,
    featured: true
  },
  {
    name: 'Wireless Gaming Mouse',
    description: 'High-precision wireless mouse with adjustable DPI and programmable buttons.',
    price: 5099,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop',
    stock: 60,
    rating: 4.4,
    reviews: 73
  },
  {
    name: 'Cotton T-Shirt - Navy Blue',
    description: '100% cotton comfortable t-shirt. Available in multiple sizes. Perfect for casual wear.',
    price: 1699,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    stock: 100,
    rating: 4.2,
    reviews: 156
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with excellent cushioning and support. Ideal for daily workouts.',
    price: 7649,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
    stock: 45,
    rating: 4.5,
    reviews: 112
  },
  {
    name: 'JavaScript: The Complete Guide',
    description: 'Comprehensive guide to modern JavaScript programming. Perfect for beginners and professionals.',
    price: 3399,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
    stock: 80,
    rating: 4.8,
    reviews: 243
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle keeps drinks cold for 24 hours. Eco-friendly and durable.',
    price: 2124,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop',
    stock: 90,
    rating: 4.4,
    reviews: 78
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat with extra cushioning. Perfect for yoga, pilates, and floor exercises.',
    price: 2549,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=300&fit=crop',
    stock: 55,
    rating: 4.3,
    reviews: 91
  },
  {
    name: 'Portable Phone Charger',
    description: '20000mAh power bank with fast charging. Charge multiple devices on the go.',
    price: 2974,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop',
    stock: 70,
    rating: 4.5,
    reviews: 134
  },
  {
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with 12-cup capacity. Wake up to fresh coffee every morning.',
    price: 5949,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&h=300&fit=crop',
    stock: 35,
    rating: 4.6,
    reviews: 102
  },
  {
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds with charging case. Clear sound and comfortable fit.',
    price: 4249,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop',
    stock: 85,
    rating: 4.4,
    reviews: 167,
    featured: true
  },
  {
    name: 'Desk Lamp with USB Port',
    description: 'LED desk lamp with adjustable brightness and built-in USB charging port.',
    price: 2974,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop',
    stock: 50,
    rating: 4.3,
    reviews: 54
  },
  {
    name: 'Basketball',
    description: 'Official size basketball with superior grip. Perfect for indoor and outdoor play.',
    price: 2549,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=300&fit=crop',
    stock: 40,
    rating: 4.5,
    reviews: 68
  },
  {
    name: 'Building Blocks Set',
    description: '500-piece building blocks set. Encourages creativity and problem-solving skills.',
    price: 3399,
    category: 'Toys',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=300&h=300&fit=crop',
    stock: 60,
    rating: 4.7,
    reviews: 89
  }
];

// Sample admin user
const adminUser = {
  name: 'Admin User',
  email: 'admin@ecommerce.com',
  password: 'admin123',
  role: 'admin',
  phone: '9999999999',
  address: {
    street: '100 Admin Street',
    city: 'Bengaluru',
    state: 'KA',
    zipCode: '560100',
    country: 'India'
  }
};

// Sample regular user
const regularUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'user',
  phone: '1234567890',
  address: {
    street: '123 Main Street',
    city: 'Bengaluru',
    state: 'KA',
    zipCode: '560100',
    country: 'India'
  }
};

const buildOrderItems = (items) => items.map(({ product, quantity }) => ({
  productId: product.id,
  quantity,
  price: product.price
}));

const calculateTotalAmount = (items) => items.reduce(
  (sum, { product, quantity }) => sum + (parseFloat(product.price) * quantity),
  0
);

// Connect to PostgreSQL and seed data
const seedDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Connected to PostgreSQL');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: true }); // WARNING: force:true drops existing tables
    console.log('✓ Database tables created');

    // Create users
    const admin = await User.create(adminUser);
    const user = await User.create(regularUser);
    console.log('✓ Created sample users');
    console.log(`  - Admin: ${admin.email} / admin123`);
    console.log(`  - User: ${user.email} / password123`);

    // Create products
    const products = await Product.bulkCreate(sampleProducts);
    console.log(`✓ Created ${products.length} sample products`);

    // Create sample orders for admin user
    const adminOrders = [
      {
        items: [
          { product: products[0], quantity: 1 },
          { product: products[3], quantity: 2 }
        ],
        paymentMethod: 'UPI',
        paymentStatus: 'Completed',
        orderStatus: 'Delivered',
        transactionId: 'TXN_SEED_1001'
      },
      {
        items: [
          { product: products[6], quantity: 1 },
          { product: products[10], quantity: 1 },
          { product: products[14], quantity: 2 }
        ],
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending',
        orderStatus: 'Processing'
      },
      {
        items: [
          { product: products[1], quantity: 1 },
          { product: products[5], quantity: 3 }
        ],
        paymentMethod: 'Credit Card',
        paymentStatus: 'Completed',
        orderStatus: 'Shipped',
        transactionId: 'TXN_SEED_1002'
      },
      {
        items: [
          { product: products[7], quantity: 2 },
          { product: products[12], quantity: 1 }
        ],
        paymentMethod: 'Net Banking',
        paymentStatus: 'Completed',
        orderStatus: 'Delivered',
        transactionId: 'TXN_SEED_1003'
      },
      {
        items: [
          { product: products[2], quantity: 1 },
          { product: products[9], quantity: 1 }
        ],
        paymentMethod: 'Debit Card',
        paymentStatus: 'Pending',
        orderStatus: 'Pending'
      }
    ];

    for (const orderData of adminOrders) {
      const totalAmount = calculateTotalAmount(orderData.items);
      const order = await Order.create({
        userId: admin.id,
        totalAmount,
        shippingAddress: adminUser.address,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus,
        orderStatus: orderData.orderStatus,
        transactionId: orderData.transactionId || null
      });

      const orderItemsPayload = buildOrderItems(orderData.items).map((item) => ({
        orderId: order.id,
        ...item
      }));

      await OrderItem.bulkCreate(orderItemsPayload);
    }

    console.log(`✓ Created ${adminOrders.length} sample orders for admin user`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nYou can now login with:');
    console.log('  Admin: admin@ecommerce.com / admin123');
    console.log('  User:  john@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();
