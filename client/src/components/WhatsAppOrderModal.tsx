import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product } from '@shared/schema';
import { INDIAN_STATES, WHATSAPP_NUMBER } from '@/lib/constants';
import { MessageCircle, X } from 'lucide-react';

const orderFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  mobile: z.string().min(10, 'Valid mobile number is required'),
  alternateMobile: z.string().optional(),
  houseFlat: z.string().min(1, 'House/Flat number is required'),
  streetArea: z.string().min(1, 'Street/Area is required'),
  landmark: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pinCode: z.string().min(6, 'Valid PIN code is required'),
  paymentMode: z.enum(['cod', 'prepaid']),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface WhatsAppOrderModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppOrderModal({ product, isOpen, onClose }: WhatsAppOrderModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      paymentMode: 'cod'
    }
  });

  const paymentMode = watch('paymentMode');
  const selectedState = watch('state');

  if (!product) return null;

  const images = Array.isArray(product.images) ? product.images : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  const onSubmit = (data: OrderFormData) => {
    if (sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }

    // Construct WhatsApp message
    const message = `🛍️ *New Order from AURA FASHION*

📦 *Product Details:*
• Name: ${product.name}
• Size: ${selectedSize || 'N/A'}
• Price: ₹${parseFloat(product.price).toLocaleString('en-IN')}
• Quantity: 1

👤 *Customer Details:*
• Name: ${data.fullName}
• Mobile: ${data.mobile}
${data.alternateMobile ? `• Alternate Mobile: ${data.alternateMobile}` : ''}

📍 *Delivery Address:*
• ${data.houseFlat}
• ${data.streetArea}
${data.landmark ? `• Landmark: ${data.landmark}` : ''}
• ${data.city}, ${data.state} - ${data.pinCode}

💰 *Payment Mode:* ${data.paymentMode === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid (Online Payment)'}

Thank you for choosing AURA FASHION! 🌟`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar" data-testid="modal-whatsapp-order">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-3 rounded-full">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Complete Your Order</DialogTitle>
              <p className="text-muted-foreground">Fill in your delivery details</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-whatsapp">
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="flex items-center space-x-4">
            {images.length > 0 && (
              <img 
                src={images[0]} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium" data-testid="text-order-product-name">{product.name}</h4>
              <div className="flex items-center space-x-4">
                {sizes.length > 0 && (
                  <div>
                    <Label htmlFor="size-select" className="text-sm">Size:</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize} required>
                      <SelectTrigger className="w-24 h-8 mt-1" data-testid="select-size">
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Quantity: 1</p>
                </div>
              </div>
              <p className="text-lg font-bold text-primary mt-2" data-testid="text-order-price">
                ₹{parseFloat(product.price).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Enter your full name"
                className={errors.fullName ? 'border-red-500' : ''}
                data-testid="input-full-name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="mobile">Mobile No *</Label>
              <Input
                id="mobile"
                type="tel"
                {...register('mobile')}
                placeholder="Enter mobile number"
                className={errors.mobile ? 'border-red-500' : ''}
                data-testid="input-mobile"
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="alternateMobile">Alternate No (Optional)</Label>
            <Input
              id="alternateMobile"
              type="tel"
              {...register('alternateMobile')}
              placeholder="Alternate contact number"
              data-testid="input-alternate-mobile"
            />
          </div>

          {/* Address Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="houseFlat">House/Flat No & Building *</Label>
              <Input
                id="houseFlat"
                {...register('houseFlat')}
                placeholder="House/Flat No & Building"
                className={errors.houseFlat ? 'border-red-500' : ''}
                data-testid="input-house-flat"
              />
              {errors.houseFlat && (
                <p className="text-red-500 text-sm mt-1">{errors.houseFlat.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="streetArea">Street/Area/Colony *</Label>
              <Input
                id="streetArea"
                {...register('streetArea')}
                placeholder="Street/Area/Colony"
                className={errors.streetArea ? 'border-red-500' : ''}
                data-testid="input-street-area"
              />
              {errors.streetArea && (
                <p className="text-red-500 text-sm mt-1">{errors.streetArea.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              {...register('landmark')}
              placeholder="Nearby landmark for easy delivery"
              data-testid="input-landmark"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="City"
                className={errors.city ? 'border-red-500' : ''}
                data-testid="input-city"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="state">State *</Label>
              <Select onValueChange={(value) => setValue('state', value)} data-testid="select-state">
                <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state.toLowerCase().replace(/\s+/g, '-')}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="pinCode">PIN Code *</Label>
              <Input
                id="pinCode"
                {...register('pinCode')}
                placeholder="PIN Code"
                className={errors.pinCode ? 'border-red-500' : ''}
                data-testid="input-pin-code"
              />
              {errors.pinCode && (
                <p className="text-red-500 text-sm mt-1">{errors.pinCode.message}</p>
              )}
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <Label>Payment Mode *</Label>
            <RadioGroup 
              value={paymentMode} 
              onValueChange={(value: 'cod' | 'prepaid') => setValue('paymentMode', value)}
              className="flex space-x-6 mt-2"
              data-testid="radio-payment-mode"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="cursor-pointer">Cash on Delivery (COD)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prepaid" id="prepaid" />
                <Label htmlFor="prepaid" className="cursor-pointer">Prepaid (Online Payment)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700 btn-hover-lift" 
              size="lg"
              disabled={isSubmitting}
              data-testid="button-send-whatsapp-order"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Processing...' : 'Send Order to WhatsApp'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="lg"
              onClick={onClose}
              data-testid="button-cancel-order"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
