import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Images } from 'lucide-react';
import { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onWhatsAppOrder: (product: Product) => void;
}

export default function ProductCard({ product, onProductClick, onWhatsAppOrder }: ProductCardProps) {
  const images = Array.isArray(product.images) ? product.images : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const discountPercentage = product.originalPrice 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : 0;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWhatsAppOrder(product);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement wishlist functionality
  };

  return (
    <div 
      className="bg-card rounded-2xl shadow-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
      onClick={() => onProductClick(product)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        <div className="h-80 overflow-hidden relative">
          {images.length > 0 ? (
            <img 
              src={images[0]} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Images className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          
          <div className="absolute top-4 left-4">
            {product.rating && parseFloat(product.rating) >= 4.5 && (
              <Badge className="bg-accent text-accent-foreground">Best Seller</Badge>
            )}
          </div>
          
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="p-2 rounded-full shadow-md hover:bg-primary hover:text-primary-foreground"
              onClick={handleWishlistClick}
              data-testid={`button-wishlist-${product.id}`}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
          
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-sm">
              <Images className="inline w-3 h-3 mr-1" />
              {images.length} photos
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-foreground line-clamp-2" data-testid={`text-title-${product.id}`}>
            {product.name}
          </h3>
          {product.rating && (
            <div className="flex text-yellow-400 text-sm">
              {[...Array(5)].map((_, i) => (
                <i key={i} className={`fa${i < Math.floor(parseFloat(product.rating!)) ? 's' : 'r'} fa-star`}></i>
              ))}
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary" data-testid={`text-price-${product.id}`}>
              ₹{parseFloat(product.price).toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  ₹{parseFloat(product.originalPrice).toLocaleString('en-IN')}
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {discountPercentage}% OFF
                </Badge>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span>Sizes: {sizes.join(', ')}</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="btn-hover-lift"
              data-testid={`button-view-details-${product.id}`}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
