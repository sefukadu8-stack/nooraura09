import Login from "./Login"; 
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Heart, ShoppingCart, Phone, Mail } from 'lucide-react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-card shadow-lg fixed w-full top-6 z-40">
      <div className="container mx-auto px-4">
        {/* Top Bar */} 
        <div className="bg-primary text-primary-foreground py-2 px-4 rounded-t-lg">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                +91 8780813692
              </span>
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                sefudinkadu@gmail.com
              </span>
            </div>
            <div className="flex space-x-3">
              <a href="#" className="hover:opacity-80" data-testid="link-instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="hover:opacity-80" data-testid="link-facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="hover:opacity-80" data-testid="link-whatsapp-header">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="py-4">
          <div className="flex items-center justify-between">
            <div className="logo">
              <h1 className="text-3xl font-serif font-bold text-primary">AURA FASHION</h1>
              <p className="text-sm text-muted-foreground">Premium Collection</p>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-foreground hover:text-primary font-medium transition-colors">
                Home
              </a>
              <a href="#products" className="text-foreground hover:text-primary font-medium transition-colors">
                Products
              </a>
              <a href="#about" className="text-foreground hover:text-primary font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-foreground hover:text-primary font-medium transition-colors">
                Contact
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-10 py-2 w-64 rounded-full"
                  data-testid="input-search"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 h-8 w-8"
                  data-testid="button-search"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 rounded-full"
                data-testid="button-wishlist"
              >
                <Heart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  0
                </span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 rounded-full"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  0
                </span>
              </Button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
