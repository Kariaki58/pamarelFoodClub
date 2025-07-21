"use client"

import { useCart } from "@/context/cart-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Truck, Wallet, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { FundWalletModal } from "@/components/wallets/FundWalletModal"

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);
      setError(null);
      
      const orderData = {
        shippingInfo: formData,
        items: cartItems.map(item => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        deliveryMethod,
        deliveryPrice,
        subtotal: totalPrice,
        total: orderTotal,
        paymentMethod: 'cash_wallet'
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
      console.log('Order created:', result.order);
      
      clearCart();
      router.push(`/order-confirmation/${result.order._id}`);
      
    } catch (err) {
      console.error('Failed to place order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

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

  const cashBalance = wallets.wallets?.cash || 0
  const hasSufficientFunds = cashBalance >= orderTotal

  // Initial loading state (only for wallet/data loading)
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
                <CardTitle>Cash Wallet</CardTitle>
                <Button variant="ghost" size="icon" disabled={isPlacingOrder}>
                  {showWallet ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <CardDescription>
                {!showWallet && (
                  <span className="flex items-center gap-2">
                    Balance: ₦{formatPrice(cashBalance)}
                    {!hasSufficientFunds && (
                      <span className="text-red-500">(Insufficient funds)</span>
                    )}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            {showWallet && (
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Wallet className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Cash Wallet</p>
                        <p className="text-sm text-muted-foreground">Main wallet for purchases</p>
                      </div>
                    </div>
                    <p className="font-medium">₦{formatPrice(cashBalance)}</p>
                  </div>
                  <Separator />
                  <div className={`flex justify-between font-bold ${hasSufficientFunds ? 'text-green-600' : 'text-red-600'}`}>
                    <p>Amount Needed</p>
                    <p>₦{formatPrice(orderTotal)}</p>
                  </div>
                  {!hasSufficientFunds && (
                    <div className="flex flex-col gap-2">
                      <p className="text-red-500 text-sm">
                        Insufficient funds. Please add ₦{formatPrice(orderTotal - cashBalance)} to your cash wallet.
                      </p>
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => setActiveModal('fund-cash')}
                        disabled={isPlacingOrder}
                      >
                        <Plus className="h-4 w-4" />
                        Add Funds
                      </Button>
                    </div>
                  )}
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
                disabled={!hasSufficientFunds || isPlacingOrder}
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
                ) : hasSufficientFunds ? 'Confirm Order' : 'Insufficient Funds'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Fund Wallet Modal */}
      {activeModal === 'fund-cash' && (
        <FundWalletModal
          key="fund-modal-cash"
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