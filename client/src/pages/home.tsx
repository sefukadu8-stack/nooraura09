import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import WhatsAppOrderModal from '@/components/WhatsAppOrderModal';
import AdminPanel from '@/components/AdminPanel';
import { Button } from '@/components/ui/button';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Product } from '@shared/schema';
import { Settings, MessageCircle, Wifi, WifiOff } from 'lucide-react';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { isConnected, connectionStatus } = useWebSocket();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return true;
    return product.category.toLowerCase() === selectedCategory;
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleWhatsAppOrder = (product: Product) => {
    setSelectedProduct(product);
    setIsWhatsAppModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Real-time Status Indicator */}
      <div className={`fixed top-0 left-0 right-0 text-white text-center py-1 text-sm z-50 ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      }`}>
        {isConnected ? (
          <><Wifi className="inline w-4 h-4 real-time-indicator mr-2" />Live Updates Active - Changes sync instantly</>
        ) : (
          <><WifiOff className="inline w-4 h-4 mr-2" />Connection lost - Attempting to reconnect...</>
        )}
      </div>

      <Header />

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center pt-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
                  New Collection 2025
                </span>
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground leading-tight">
                  Discover Your 
                  <span className="text-primary"> Elegance</span>
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-lg">
                AURA FASHION
              </p>
              <div className="flex space-x-4">
                <Button size="lg" className="btn-hover-lift">
                  Shop Collection
                </Button>
                <Button variant="outline" size="lg" className="btn-hover-lift">
                  View Lookbook
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://pixabay.com/get/g82b84cb98c76928f120d9105c332d178923c4cf1c0f990d66a46daf26007f4c5662aeebe71bbbe26ee0ffd123de6999e6bd4d1b23c324bf2d555414b5d0e0f36_1280.jpg" 
                alt="Elegant woman in traditional kurta" 
                className="rounded-2xl shadow-2xl image-zoom"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <i className="fas fa-star text-primary-foreground"></i>
                  </div>
                  <div>
                    <p className="font-semibold">Premium Quality</p>
                    <p className="text-sm text-muted-foreground">Handcrafted Excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4">Featured Products</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked collection of premium kurta sets, each designed to celebrate your unique style
            </p>
          </div>

          {/* Product Filters */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2 bg-card rounded-full p-2 shadow-md">
              {['all', 'Readymade', 'Suits', 'Kurtis', 'designer'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  data-testid={`filter-${category}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl shadow-lg overflow-hidden">
                  <div className="h-80 bg-muted loading-shimmer" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-muted loading-shimmer rounded" />
                    <div className="h-4 bg-muted loading-shimmer rounded w-2/3" />
                    <div className="h-8 bg-muted loading-shimmer rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={handleProductClick}
                  onWhatsAppOrder={handleWhatsAppOrder}
                />
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <p className="text-2xl font-semibold text-muted-foreground mb-4">
                No products found in this category
              </p>
              <p className="text-muted-foreground">
                Try selecting a different category or check back later for new arrivals.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold mb-6">AURA FASHION Story</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                AURA FASHION At AURA FASHION, we bring you carefully selected designs that perfectly blend traditional beauty with modern fashion.
Each kurta set in our collection is handpicked for its quality, comfort, and style, ensuring you get only the best pieces that enhance your personality with grace and elegance.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Each piece is handpicked for its quality, design, and comfort, ensuring that every woman feels 
                confident and beautiful in our creations.
              </p>
              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="text-muted-foreground">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100+</div>
                  <div className="text-muted-foreground">Unique Designs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">4.9</div>
                  <div className="text-muted-foreground">Customer Rating</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://pixabay.com/get/g7b665f75f7ffcfd865775314e410c225e0f44422a80c6aff9bd31cc3a8f03ced6fc1d0d3dca7088d759599f4f722c93565f26a97ec688ff61920619aa84916e7_1280.jpg" 
                alt="Traditional Indian fashion" 
                className="rounded-2xl shadow-2xl image-zoom"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <i className="fas fa-award text-secondary-foreground"></i>
                  </div>
                  <div>
                    <p className="font-semibold">Quality Assured</p>
                    <p className="text-sm text-muted-foreground">Premium Materials Only</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">AURA FASHION</h3>
              <p className="text-secondary-foreground/80 mb-4">
                Premium Collection celebrating traditional Indian fashion with contemporary elegance.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="bg-secondary-foreground/20 p-2 rounded-full hover:bg-secondary-foreground/30 transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="bg-secondary-foreground/20 p-2 rounded-full hover:bg-secondary-foreground/30 transition-colors">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="bg-secondary-foreground/20 p-2 rounded-full hover:bg-secondary-foreground/30 transition-colors">
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-secondary-foreground/80">
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Products</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-secondary-foreground/80">
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Readymade</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Suits</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Party Wear</a></li>
                <li><a href="#" className="hover:text-secondary-foreground transition-colors">Designer Sets</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-secondary-foreground/80">
                <li className="flex items-center space-x-2">
                  <i className="fas fa-phone"></i>
                  <span>+91 8780813692</span>
                </li>
                <li className="flex items-center space-x-2">
                  <i className="fas fa-envelope"></i>
                  <span>sefudinkadu@gmail.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <i className="fab fa-whatsapp"></i>
                  <span>WhatsApp Support</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-foreground/20 pt-8 text-center text-secondary-foreground/60">
            <p>&copy; 2025 AURA FASHION. All rights reserved. | Made with ❤️ for fashion lovers</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="admin-floating">
        <Button
          size="lg"
          className="rounded-full w-16 h-16 shadow-lg"
          onClick={() => setIsAdminPanelOpen(true)}
          data-testid="button-admin"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      <div className="whatsapp-float">
        <Button
          size="lg"
          className="rounded-full w-16 h-16 shadow-lg bg-green-600 hover:bg-green-700"
          asChild
        >
          <a href="https://wa.me/918780813692" target="_blank" rel="noopener noreferrer" data-testid="link-whatsapp">
            <MessageCircle className="w-8 h-8" />
          </a>
        </Button>
      </div>

      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onWhatsAppOrder={handleWhatsAppOrder}
      />

      <WhatsAppOrderModal
        product={selectedProduct}
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />
    </div>
  );
}
