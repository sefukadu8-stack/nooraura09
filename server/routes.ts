import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const broadcastToAll = (message: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data);

        // Handle real-time admin actions
        if (data.type === 'admin_update') {
          broadcastToAll({
            type: 'admin_update',
            action: data.action,
            data: data.data,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Real-time connection established',
      timestamp: new Date().toISOString()
    }));
  });

  // Authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(401).json({ message: "Username and password required" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.user = user;
    next();
  };

  // Admin authentication
  app.post("/api/admin/login", requireAuth, async (req, res) => {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    res.json({ 
      message: "Admin login successful", 
      user: { id: user.id, username: user.username, role: user.role }
    });
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      
      // Broadcast real-time update
      broadcastToAll({
        type: 'product_created',
        product,
        timestamp: new Date().toISOString()
      });

      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Broadcast real-time update
      broadcastToAll({
        type: 'product_updated',
        product,
        timestamp: new Date().toISOString()
      });

      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Broadcast real-time update
      broadcastToAll({
        type: 'product_deleted',
        productId: req.params.id,
        timestamp: new Date().toISOString()
      });

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      
      // Broadcast real-time update
      broadcastToAll({
        type: 'order_created',
        order,
        timestamp: new Date().toISOString()
      });

      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Broadcast real-time update
      broadcastToAll({
        type: 'order_updated',
        order,
        timestamp: new Date().toISOString()
      });

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  return httpServer;
}
