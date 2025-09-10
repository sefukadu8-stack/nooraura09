import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiRequest } from '@/lib/queryClient';
import { insertProductSchema, Product, Order } from '@shared/schema';
import { z } from 'zod';
import { X, Plus, Edit, Trash2, Package, ShoppingCart, Settings as SettingsIcon, BarChart, Upload, Link as LinkIcon } from 'lucide-react';

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginData = z.infer<typeof adminLoginSchema>;
type ProductFormData = z.infer<typeof insertProductSchema>;

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sendMessage } = useWebSocket();

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoggingIn }
  } = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema)
  });

  // Product form
  const {
    register: registerProduct,
    handleSubmit: handleProductSubmit,
    setValue: setProductValue,
    watch: watchProduct,
    reset: resetProduct,
    formState: { errors: productErrors, isSubmitting: isProductSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      images: [],
      sizes: [],
      features: [],
      isActive: true,
    }
  });

  // Queries
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: isLoggedIn,
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: isLoggedIn,
  });

  // Mutations
  const loginMutation = useMutation({
    mutationFn: (data: AdminLoginData) => apiRequest('POST', '/api/admin/login', data),
    onSuccess: () => {
      setIsLoggedIn(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormData) => apiRequest('POST', '/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      resetProduct();
      setShowProductForm(false);
      setImageUrls(['']);
      
      // Send WebSocket update
      sendMessage({
        type: 'admin_update',
        action: 'product_change',
        data: { action: 'created' }
      });

      toast({
        title: "Product Created",
        description: "Product has been successfully created",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) => 
      apiRequest('PUT', `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      resetProduct();
      setShowProductForm(false);
      setEditingProduct(null);
      setImageUrls(['']);
      
      // Send WebSocket update
      sendMessage({
        type: 'admin_update',
        action: 'product_change',
        data: { action: 'updated' }
      });

      toast({
        title: "Product Updated",
        description: "Product has been successfully updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      // Send WebSocket update
      sendMessage({
        type: 'admin_update',
        action: 'product_change',
        data: { action: 'deleted' }
      });

      toast({
        title: "Product Deleted",
        description: "Product has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleLogin = (data: AdminLoginData) => {
    loginMutation.mutate(data);
  };

  const handleCreateProduct = (data: ProductFormData) => {
    const validImages = imageUrls.filter(url => url.trim() !== '');
    const productData = {
      ...data,
      images: validImages,
      sizes: data.sizes || [],
      features: data.features || [],
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
    
    // Populate form with product data
    Object.keys(product).forEach((key) => {
      const value = product[key as keyof Product];
      if (key === 'images' && Array.isArray(value)) {
        setImageUrls([...value, '']);
      } else {
        setProductValue(key as keyof ProductFormData, value as any);
      }
    });
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const addImageUrl = () => {
    if (imageUrls.length < 20) {
      setImageUrls([...imageUrls, '']);
    }
  };

  const updateImageUrl = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  const removeImageUrl = (index: number) => {
    if (imageUrls.length > 1) {
      const newUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newUrls);
    }
  };

  if (!isLoggedIn) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md" data-testid="modal-admin-login">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
              Admin Login
            </h2>
            <form onSubmit={handleLoginSubmit(handleLogin)} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...registerLogin('username')}
                  placeholder="Enter username"
                  className={loginErrors.username ? 'border-red-500' : ''}
                  data-testid="input-admin-username"
                />
                {loginErrors.username && (
                  <p className="text-red-500 text-sm mt-1">{loginErrors.username.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...registerLogin('password')}
                  placeholder="Enter password"
                  className={loginErrors.password ? 'border-red-500' : ''}
                  data-testid="input-admin-password"
                />
                {loginErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{loginErrors.password.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoggingIn}
                data-testid="button-admin-login"
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] p-0 overflow-hidden" data-testid="modal-admin-panel">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-muted p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-admin">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <nav className="space-y-2">
              <Button
                variant={activeTab === 'products' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('products')}
                data-testid="button-tab-products"
              >
                <Package className="w-4 h-4 mr-2" />
                Products
              </Button>
              
              <Button
                variant={activeTab === 'orders' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('orders')}
                data-testid="button-tab-orders"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Orders
              </Button>
              
              <Button
                variant={activeTab === 'settings' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('settings')}
                data-testid="button-tab-settings"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              
              <Button
                variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('analytics')}
                data-testid="button-tab-analytics"
              >
                <BarChart className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Products Management</h3>
                  <Button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                      resetProduct();
                      setImageUrls(['']);
                    }}
                    data-testid="button-add-product"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {showProductForm && (
                  <div className="bg-background border border-border p-6 rounded-lg">
                    <h4 className="text-xl font-bold mb-6">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h4>
                    
                    <form onSubmit={handleProductSubmit(handleCreateProduct)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            {...registerProduct('name')}
                            placeholder="Enter product name"
                            className={productErrors.name ? 'border-red-500' : ''}
                            data-testid="input-product-name"
                          />
                          {productErrors.name && (
                            <p className="text-red-500 text-sm mt-1">{productErrors.name.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select onValueChange={(value) => setProductValue('category', value)} data-testid="select-product-category">
                            <SelectTrigger className={productErrors.category ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cotton">Cotton</SelectItem>
                              <SelectItem value="Silk">Silk</SelectItem>
                              <SelectItem value="Chiffon">Chiffon</SelectItem>
                              <SelectItem value="Designer">Designer</SelectItem>
                            </SelectContent>
                          </Select>
                          {productErrors.category && (
                            <p className="text-red-500 text-sm mt-1">{productErrors.category.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          {...registerProduct('description')}
                          placeholder="Product description"
                          rows={3}
                          className={productErrors.description ? 'border-red-500' : ''}
                          data-testid="input-product-description"
                        />
                        {productErrors.description && (
                          <p className="text-red-500 text-sm mt-1">{productErrors.description.message}</p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="price">Price (₹) *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            {...registerProduct('price')}
                            placeholder="2499"
                            className={productErrors.price ? 'border-red-500' : ''}
                            data-testid="input-product-price"
                          />
                          {productErrors.price && (
                            <p className="text-red-500 text-sm mt-1">{productErrors.price.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="originalPrice">Original Price (₹)</Label>
                          <Input
                            id="originalPrice"
                            type="number"
                            step="0.01"
                            {...registerProduct('originalPrice')}
                            placeholder="3999"
                            data-testid="input-product-original-price"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="stock">Stock Quantity *</Label>
                          <Input
                            id="stock"
                            type="number"
                            {...registerProduct('stock')}
                            placeholder="15"
                            className={productErrors.stock ? 'border-red-500' : ''}
                            data-testid="input-product-stock"
                          />
                          {productErrors.stock && (
                            <p className="text-red-500 text-sm mt-1">{productErrors.stock.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Multi-Image Upload */}
                      <div>
                        <Label>Product Images (Up to 20 images)</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6">
                          <div className="text-center mb-4">
                            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">Add image URLs for your product</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Supports JPG, PNG, WebP from any URL
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            {imageUrls.map((url, index) => (
                              <div key={index} className="flex space-x-2">
                                <Input
                                  value={url}
                                  onChange={(e) => updateImageUrl(index, e.target.value)}
                                  placeholder={`Image URL ${index + 1}`}
                                  className="flex-1"
                                  data-testid={`input-image-url-${index}`}
                                />
                                {imageUrls.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeImageUrl(index)}
                                    data-testid={`button-remove-image-${index}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            
                            {imageUrls.length < 20 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={addImageUrl}
                                className="w-full"
                                data-testid="button-add-image-url"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Another Image URL
                              </Button>
                            )}
                          </div>

                          {/* Image Preview */}
                          {imageUrls.some(url => url.trim() !== '') && (
                            <div className="grid grid-cols-6 gap-4 mt-4">
                              {imageUrls
                                .filter(url => url.trim() !== '')
                                .map((url, index) => (
                                  <div key={index} className="aspect-square border border-border rounded-lg overflow-hidden">
                                    <img
                                      src={url}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjVmNWY1Ii8+CjxwYXRoIGQ9Ik0xMiA5VjE1TTkgMTJIMTUiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                                      }}
                                    />
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Available Sizes */}
                      <div>
                        <Label>Available Sizes</Label>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {['XS', 'XXL', '3XL', '4XL', '5XL', '6XL', '7XL', 'Free Size'].map((size) => (
                            <label key={size} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  const currentSizes = watchProduct('sizes') || [];
                                  if (e.target.checked) {
                                    setProductValue('sizes', [...(Array.isArray(currentSizes) ? currentSizes : []), size]);
                                  } else {
                                    setProductValue('sizes', (Array.isArray(currentSizes) ? currentSizes : []).filter((s: string) => s !== size));
                                  }
                                }}
                                className="rounded border-border text-primary focus:ring-ring"
                                data-testid={`checkbox-size-${size}`}
                              />
                              <span>{size}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Button 
                          type="submit" 
                          disabled={isProductSubmitting}
                          data-testid="button-save-product"
                        >
                          {isProductSubmitting 
                            ? 'Saving...' 
                            : editingProduct 
                              ? 'Update Product' 
                              : 'Save Product'
                          }
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setShowProductForm(false);
                            setEditingProduct(null);
                            resetProduct();
                            setImageUrls(['']);
                          }}
                          data-testid="button-cancel-product"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products List */}
                {isLoadingProducts ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-background border border-border p-6 rounded-lg">
                        <div className="animate-pulse flex items-center space-x-4">
                          <div className="w-16 h-16 bg-muted rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/3"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => {
                      const images = Array.isArray(product.images) ? product.images : [];
                      const sizes = Array.isArray(product.sizes) ? product.sizes : [];
                      
                      return (
                        <div key={product.id} className="bg-background border border-border p-6 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {images.length > 0 && (
                                <img 
                                  src={images[0]} 
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <h4 className="font-semibold" data-testid={`text-admin-product-${product.id}`}>
                                  {product.name}
                                </h4>
                                <p className="text-muted-foreground">
                                  ₹{parseFloat(product.price).toLocaleString('en-IN')} | Stock: {product.stock}
                                </p>
                                <div className="flex space-x-2 mt-2">
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    {images.length} images
                                  </Badge>
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    {sizes.length} sizes
                                  </Badge>
                                  <Badge 
                                    variant={product.isActive ? "default" : "secondary"}
                                    className={product.isActive ? "bg-green-500" : "bg-gray-500"}
                                  >
                                    {product.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                                data-testid={`button-edit-${product.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProduct(product)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`button-delete-${product.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <div className="flex items-center ml-4">
                                <span className="text-sm text-muted-foreground mr-2">Live</span>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Orders Management</h3>
                
                {isLoadingOrders ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-background border border-border p-6 rounded-lg">
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-xl font-semibold text-muted-foreground mb-2">No orders yet</p>
                    <p className="text-muted-foreground">Orders will appear here when customers place them</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-background border border-border p-6 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {order.productName} - Size: {order.size}
                            </h4>
                            <p className="text-muted-foreground">
                              Customer: {order.customerName} | Mobile: {order.mobile}
                            </p>
                            <p className="text-muted-foreground">
                              Address: {order.address}, {order.city}, {order.state} - {order.pinCode}
                            </p>
                            <p className="text-lg font-bold text-primary mt-2">
                              ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')} - {order.paymentMode.toUpperCase()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={order.status === 'completed' ? 'default' : 'secondary'}
                              className={
                                order.status === 'completed' ? 'bg-green-500' :
                                order.status === 'processing' ? 'bg-yellow-500' :
                                'bg-gray-500'
                              }
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Settings</h3>
                <div className="bg-background border border-border p-6 rounded-lg">
                  <p className="text-muted-foreground">Settings panel will be available in future updates.</p>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Analytics</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-background border border-border p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{products.length}</div>
                    <div className="text-muted-foreground">Total Products</div>
                  </div>
                  <div className="bg-background border border-border p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{orders.length}</div>
                    <div className="text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="bg-background border border-border p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {products.filter(p => p.stock > 0).length}
                    </div>
                    <div className="text-muted-foreground">In Stock</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
