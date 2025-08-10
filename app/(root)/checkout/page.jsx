"use client"

import { useCart } from "@/context/cart-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Truck, Wallet, ChevronDown, ChevronUp, Plus, AlertCircle } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { FundWalletModal } from "@/components/wallets/FundWalletModal"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function CheckoutPage() {
  const { cartItems, totalPrice, cartCount, clearCart } = useCart()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wallets, setWallets] = useState({})
  const [walletLoading, setWalletLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showWallet, setShowWallet] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState('standard')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: ''
  })
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [selectedWallet, setSelectedWallet] = useState('cash') // 'cash', 'food', or 'gadget'

  // Delivery options with prices
  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      price: 0,
      description: '4-6 business days',
      icon: <Truck className="mb-2 h-6 w-6"/>
    },
    {
      id: 'express',
      name: 'Express Delivery',
      price: 1000,
      description: '1-2 business days',
      icon: <Truck className="mb-2 h-6 w-6 animate-pulse"/>
    }
  ]

  // Calculate total including delivery
  const deliveryPrice = deliveryOptions.find(opt => opt.id === deliveryMethod)?.price || 0
  const orderTotal = totalPrice + deliveryPrice

  // Check if selected wallet can be used with current cart
  const validateSelectedWallet = () => {
    const sections = new Set(cartItems.map(item => item.section));
    
    // Cash wallet can always be used
    if (selectedWallet === 'cash') {
      return {
        isValid: wallets.wallets?.cash >= orderTotal,
        message: wallets.wallets?.cash >= orderTotal 
          ? 'Payment will use cash wallet'
          : 'Insufficient cash wallet balance',
        canFund: true
      };
    }

    // For food/gadget wallets, check if all items match
    if (sections.size > 1 || !sections.has(selectedWallet)) {
      return {
        isValid: false,
        message: `Cannot use ${selectedWallet} wallet with mixed or non-${selectedWallet} items`,
        canFund: false
      };
    }

    // Check wallet balance
    return {
      isValid: wallets.wallets?.[selectedWallet] >= orderTotal,
      message: wallets.wallets?.[selectedWallet] >= orderTotal
        ? `Payment will use ${selectedWallet} wallet`
        : `Insufficient ${selectedWallet} wallet balance`,
      canFund: false
    };
  };

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);
      setError(null);

      // Validate form
      if (!formData.address || !formData.email || !formData.name || !formData.city || !formData.zip) {
        toast.error("All fields are required.");
        return;
      }

      // Validate wallet payment
      const paymentValidation = validateSelectedWallet();
      if (!paymentValidation.isValid) {
        toast.error(paymentValidation.message);
        return;
      }

      const orderData = {
        shippingInfo: formData,
        items: cartItems.map(item => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          section: item.section
        })),
        deliveryMethod,
        deliveryPrice,
        subtotal: totalPrice,
        total: orderTotal,
        paymentMethod: selectedWallet === 'cash' 
          ? 'cash_wallet' 
          : `${selectedWallet}_wallet`
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();
      clearCart();
      router.push(`/order-confirmation/${result.order._id}`);
      
    } catch (err) {
      console.error('Failed to place order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Refresh wallet balance after funding
  const handleWalletFunded = async () => {
    try {
      setWalletLoading(true);
      const response = await fetch('/api/wallets', {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch wallets: ${response.status}`);
      }

      const data = await response.json();
      setWallets(data || {});
      setActiveModal(null); // Close modal after successful funding
    } catch (err) {
      console.error('Failed to fetch wallets:', err);
    } finally {
      setWalletLoading(false);
    }
  };

  // Set initial form values from session
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))
    }
  }, [session])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/checkout')
    }
  }, [status, router])

  // Fetch wallets
  useEffect(() => {
    if (status !== 'authenticated') return

    const fetchWallets = async () => {
      try {
        setWalletLoading(true)
        setError(null)
        
        const response = await fetch('/api/wallets', {
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch wallets: ${response.status}`)
        }

        const data = await response.json()
        setWallets(data || {})
      } catch (err) {
        console.error('Failed to fetch wallets:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setWalletLoading(false)
      }
    }

    fetchWallets()
  }, [status])

  // Initial loading state
  if (status === 'loading' || walletLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="md:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          <h2 className="font-bold">Error Loading Wallet Information</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const paymentValidation = validateSelectedWallet()

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter your city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  placeholder="Enter your ZIP code"
                  value={formData.zip}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {deliveryOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                      deliveryMethod === option.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setDeliveryMethod(option.id)}
                  >
                    <div className="mr-4">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{option.name}</h3>
                        <span className="font-medium">₦{formatPrice(option.price)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader 
              className={`cursor-pointer ${isPlacingOrder ? 'pointer-events-none' : ''}`} 
              onClick={() => !isPlacingOrder && setShowWallet(!showWallet)}
            >
              <div className="flex items-center justify-between">
                <CardTitle>Payment Method</CardTitle>
                <Button variant="ghost" size="icon" disabled={isPlacingOrder}>
                  {showWallet ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <CardDescription>
                {!showWallet && (
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{selectedWallet} wallet</span>
                    <span>•</span>
                    <span>₦{formatPrice(wallets.wallets?.[selectedWallet] || 0)}</span>
                    {!paymentValidation.isValid && (
                      <span className="text-red-500 text-sm">(Not available)</span>
                    )}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            {showWallet && (
              <CardContent>
                <div className="space-y-4">
                  {/* Wallet Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedWallet('cash')}
                      className={`p-3 border rounded-lg flex flex-col items-center ${
                        selectedWallet === 'cash' ? 'border-primary bg-primary/5' : 'border-transparent'
                      }`}
                    >
                      <div className="p-2 rounded-full bg-primary/10 mb-2">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm">Cash</span>
                      <span className="text-xs text-muted-foreground">Any items</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedWallet('food')}
                      className={`p-3 border rounded-lg flex flex-col items-center ${
                        selectedWallet === 'food' ? 'border-green-500 bg-green-50' : 'border-transparent'
                      }`}
                    >
                      <div className="p-2 rounded-full bg-green-100 mb-2">
                        <Wallet className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm">Food</span>
                      <span className="text-xs text-muted-foreground">Food only</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedWallet('gadget')}
                      className={`p-3 border rounded-lg flex flex-col items-center ${
                        selectedWallet === 'gadget' ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                      }`}
                    >
                      <div className="p-2 rounded-full bg-blue-100 mb-2">
                        <Wallet className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-sm">Gadget</span>
                      <span className="text-xs text-muted-foreground">Gadget only</span>
                    </button>
                  </div>

                  {/* Wallet Details */}
                  <div className={`p-4 border rounded-lg ${
                    selectedWallet === 'cash' ? 'bg-primary/5' : 
                    selectedWallet === 'food' ? 'bg-green-50' : 'bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          selectedWallet === 'cash' ? 'bg-primary/10' : 
                          selectedWallet === 'food' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <Wallet className={`h-5 w-5 ${
                            selectedWallet === 'cash' ? 'text-primary' : 
                            selectedWallet === 'food' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{selectedWallet} Wallet</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedWallet === 'cash' 
                              ? 'Pays for any products' 
                              : `Only for ${selectedWallet} products`}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">₦{formatPrice(wallets.wallets?.[selectedWallet] || 0)}</p>
                    </div>
                  </div>

                  {/* Validation Message */}
                  <div className={`p-3 rounded-lg flex items-start gap-2 ${
                    paymentValidation.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {!paymentValidation.isValid && (
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{paymentValidation.message}</p>
                      {!paymentValidation.isValid && paymentValidation.canFund && (
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-inherit mt-1"
                          onClick={() => setActiveModal('fund-cash')}
                        >
                          Add funds to cash wallet
                        </Button>
                      )}
                      {!paymentValidation.isValid && !paymentValidation.canFund && (
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-inherit mt-1"
                          onClick={() => setSelectedWallet('cash')}
                        >
                          Switch to cash wallet
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ₦{formatPrice(item.price)} × {item.quantity}
                      </p>
                      {/* <p>{JSON.stringify(item)}</p> */}
                      <Badge variant="outline" className="mt-1 text-xs">
                        {item.section}
                      </Badge>
                    </div>
                    <p className="font-medium">₦{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>₦{formatPrice(totalPrice)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Delivery</p>
                  <p>₦{formatPrice(deliveryPrice)}</p>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>₦{formatPrice(orderTotal)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!paymentValidation.isValid || isPlacingOrder}
                onClick={handlePlaceOrder}
              >
                {isPlacingOrder ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : paymentValidation.isValid ? 'Confirm Order' : 'Cannot Place Order'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Wallet Funding Modal (only for cash wallet) */}
      {activeModal === 'fund-cash' && (
        <FundWalletModal
          walletType="cash"
          walletName="Cash Wallet"
          callbackUrl="/checkout"
          onClose={() => setActiveModal(null)}
          onSuccess={handleWalletFunded}
        />
      )}
    </div>
  )
}