import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected for Seeding");

    await User.deleteMany();
    await Product.deleteMany();

    console.log("🧹 Old Data Cleared");

    const products = await Product.insertMany([
  {
    title: "Apple iPhone 14 Pro (128GB, Deep Purple)",
    price: 119999,
    description: "Super Retina XDR display, A16 Bionic chip, 48MP Pro camera, Dynamic Island",
    image: "https://res.cloudinary.com/ddutq32up/image/upload/v1771573893/s-l1200_a0awu1.jpg",
  },
  {
    title: "Samsung Galaxy S23 Ultra (Phantom Black)",
    price: 124999,
    description: "200MP camera, Snapdragon 8 Gen 2, 120Hz AMOLED display, 5000mAh battery",
    image: "https://res.cloudinary.com/ddutq32up/image/upload/v1771573763/Samsung_Galaxy_S23_Ultra_Phantom_Black_pzite5.jpg",
  },
  {
    title: "MacBook Air M2 (13-inch, 256GB SSD)",
    price: 114900,
    description: "Apple M2 chip, lightweight design, Liquid Retina display, all-day battery life",
    image: "https://res.cloudinary.com/ddutq32up/image/upload/v1771573763/MacBook_Air_M2_13-inch_256GB_SSD_x9exgn.jpg",
  },
  {
    title: "Sony WH-1000XM5 Wireless Headphones",
    price: 29990,
    description: "Industry-leading noise cancellation, crystal-clear calls, 30-hour battery",
    image: "https://res.cloudinary.com/ddutq32up/image/upload/v1771573764/Sony_WH-1000XM5_Wireless_Headphones_k6q54w.avif",
  },
  {
    title: "Logitech MX Master 3S Wireless Mouse",
    price: 9995,
    description: "Ultra-fast scrolling, ergonomic design, precision tracking, multi-device support",
    image: "https://res.cloudinary.com/ddutq32up/image/upload/v1771573761/Logitech_MX_Master_3S_Wireless_Mouse_bapsbs.webp",
  },
  {
    title: "Keychron K8 Mechanical Keyboard",
    price: 8499,
    description: "Wireless mechanical keyboard with hot-swappable switches and RGB backlight",
    image: "https://res.cloudinary.com/ddutq32up/image/upload/v1771573760/Keychron_K8_Mechanical_Keyboard_wg7v9n.jpg",
  },
  {
    title: "boAt Stone 1200 Bluetooth Speaker",
    price: 6999,
    description: "Portable wireless speaker with deep bass, RGB LEDs, and long battery life",
    image: "https://res.cloudinary.com/ddutq32up/image/upload/v1771573761/boAt_Stone_1200_Bluetooth_Speaker_rnlinl.jpg",
  },
  {
    title: "Canon EOS 1500D DSLR Camera",
    price: 45999,
    description: "24.1MP sensor, Full HD video, WiFi connectivity, EF-S 18-55mm lens kit",
    image: "https://res.cloudinary.com/ddutq32up/image/upload/v1771573761/Canon_EOS_1500D_DSLR_Camera_vmlqhz.jpg",
  },
  {
    title: "Noise ColorFit Pro 4 Smart Watch",
    price: 5999,
    description: "AMOLED display, heart rate monitoring, SpO2 tracking, 100+ sports modes",
    image: "https://res.cloudinary.com/ddutq32up/image/upload/v1771573762/Noise_ColorFit_Pro_4_Smart_Watch_rp3rf3.jpg",
  },
  {
    title: "Ergonomic Mesh Office Chair",
    price: 10999,
    description: "Breathable mesh back, adjustable height, lumbar support, smooth swivel base",
    image: "https://res.cloudinary.com/ddutq32up/image/upload/v1771573761/Ergonomic_Mesh_Office_Chair_zfb3s0.avif",
  },
]);

    console.log("📦 Products Seeded");

    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.insertMany([
      {
        name: "Demo User One",
        email: "user1@mail.com",
        password: hashedPassword,
        favorites: [products[0]._id],
      },
      {
        name: "Demo User Two",
        email: "user2@mail.com",
        password: hashedPassword,
        favorites: [],
      },
    ]);

    console.log("👤 Users Seeded");

    console.log("🎉 Seeding Completed");

    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
