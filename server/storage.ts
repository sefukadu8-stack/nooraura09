import { type User, type InsertUser, type Product, type InsertProduct, type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Order methods
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    
    // Initialize with default admin user
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default admin
    const adminUser: User = {
      id: randomUUID(),
      username: "kadusefu4@gmail.com",
      password: "sajjadkaduu", // In production, this should be hashed
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample products
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        name: "Elegant Readymade Kurta Set",
        description: "Premium Readymade blend kurta set featuring intricate embroidery work and comfortable fit. Perfect for festivals, parties, and special occasions.",
        category: "Readymade",
        price: "2499",
        originalPrice: "3999",
        stock: 15,
        images: [
          "https://pixabay.com/get/gd7503d48745346f066809fd7739606a25612e1368edfaa7954bc49a32988587adf15ceaebfa605692ef6fd55b70173928af71940f375d7b1c8c241bae6027090_1280.jpg",
          "https://pixabay.com/get/g25965f13dd8e855426ea0bb2163588733239ce9c5d9bb26dffc349ea6142b7742d7f3f494285ea951cfb0673dd12268f5283fc2e751798ec06d4988b2a2af9c0_1280.jpg",
          "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        features: [
          "Premium Readymade blend fabric",
          "Intricate hand embroidery",
          "Comfortable regular fit",
          "Machine washable",
          "Matching dupatta included"
        ],
        rating: "4.9",
        reviewCount: 127,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Designer Suits Kurta",
        description: "Luxurious Suits kurta with golden thread work, perfect for special occasions and celebrations.",
        category: "Suits",
        price: "4999",
        originalPrice: "6999",
        stock: 8,
        images: [
          "https://pixabay.com/get/g428aba508aa30aebb68cb88bd4b7a000b6d30ef49f418364e168d03a85febec05b6a48a5d20cd4b2bfa44e1969bdbb5f1fad8fbc5de8738d7118656435578cf3_1280.jpg"
        ],
        sizes: ["M", "L", "XL", "XXL"],
        features: [
          "Pure Suits fabric",
          "Golden thread work",
          "Designer collection",
          "Dry clean only"
        ],
        rating: "4.7",
        reviewCount: 89,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Party Wear Kurtis",
        description: "Flowing Kurtis kurta with mirror work details, ideal for evening parties and gatherings.",
        category: "Kurtis",
        price: "3799",
        originalPrice: "5299",
        stock: 12,
        images: [
          "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"
        ],
        sizes: ["S", "M", "L", "XL"],
        features: [
          "Flowing Kurtis fabric",
          "Mirror work details",
          "Party wear collection",
          "Hand wash recommended"
        ],
        rating: "4.8",
        reviewCount: 156,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isActive);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      images: insertProduct.images || [],
      sizes: insertProduct.sizes || [],
      features: insertProduct.features || [],
      rating: insertProduct.rating || "0",
      reviewCount: insertProduct.reviewCount || 0,
      isActive: insertProduct.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct: Product = {
      ...existingProduct,
      ...productUpdate,
      updatedAt: new Date(),
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      status: insertOrder.status || "pending",
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;

    const updatedOrder: Order = {
      ...existingOrder,
      status,
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
