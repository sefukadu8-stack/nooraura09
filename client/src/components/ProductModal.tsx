import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Heart, ShoppingCart, MessageCircle, Truck, RotateCcw, Shield } from 'lucide-react';
import { Product } from '@shared/schema';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onWhatsAppOrder: (product: Product) => void;
}

export default function ProductModal({ product, isOpen, onClose, onWhatsAppOrder }: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');

  if (!product) return null;

  const images = Array.isArray(product.images) ? product.images : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const features = Array.isArray(product.features) ? product.features : [];
  
  const discountPercentage = product.originalPrice 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : 0;

  const handleWhatsAppOrder = () => {
    onWhatsAppOrder(product);
    onClose();
  };

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const previousImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] p-0 overflow-hidden" data-testid="modal-product">
        <div className="grid md:grid-cols-2 gap-0 h-full">
          {/* Image Gallery */}
          <div className="relative bg-muted">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-card text-foreground rounded-full p-2"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Main Image */}
            <div className="h-96 md:h-full relative overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]}
                  alt={`${product.name} - View ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  data-testid="img-main-product"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70"
                    onClick={previousImage}
                    data-testid="button-previous-image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70"
                    onClick={nextImage}
                    data-testid="button-next-image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex space-x-2 overflow-x-auto image-carousel pb-2">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-primary opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:border-primary'
                      }`}
                      onClick={() => selectImage(index)}
                      data-testid={`img-thumbnail-${index}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  {product.rating && parseFloat(product.rating) >= 4.5 && (
                    <Badge className="bg-accent text-accent-foreground">Best Seller</Badge>
                  )}
                  {product.rating && (
                    <div className="flex items-center text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fa${i < Math.floor(parseFloat(product.rating!)) ? 's' : 'r'} fa-star`}></i>
                      ))}
                      <span className="ml-2 text-muted-foreground">
                        ({product.rating}) {product.reviewCount} reviews
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-3xl font-serif font-bold mb-4" data-testid="text-product-title">
                  {product.name}
                </h2>
                <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-primary" data-testid="text-product-price">
                  ₹{parseFloat(product.price).toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{parseFloat(product.originalPrice).toLocaleString('en-IN')}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 font-medium">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div className="space-y-3">
                  <label className="text-lg font-semibold">Select Size</label>
                  <div className="flex space-x-3">
                    {sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        className="px-4 py-2 font-medium"
                        onClick={() => setSelectedSize(size)}
                        data-testid={`button-size-${size}`}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Size Guide | Free Exchanges</p>
                </div>
              )}

              {/* Features */}
              {features.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Product Features</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2 text-sm"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button 
                  className="flex-1 btn-hover-lift" 
                  size="lg"
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 btn-hover-lift"
                  onClick={handleWhatsAppOrder}
                  data-testid="button-whatsapp-order"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Order on WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  data-testid="button-wishlist-modal"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>

              {/* Delivery Info */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 text-green-600 mr-2" />
                    <span>Free Delivery</span>
                  </div>
                  <div className="flex items-center">
                    <RotateCcw className="w-4 h-4 text-blue-600 mr-2" />
                    <span>Easy Returns</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-purple-600 mr-2" />
                    <span>Secure Payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
