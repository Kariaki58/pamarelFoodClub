"use client"

import { useCart } from "@/context/cart-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Truck, CreditCard, Landmark, HandCoins } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function CheckoutPage() {
  const { cartItems, totalPrice, cartCount } = useCart()

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
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Main St" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Anytown" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" placeholder="12345" />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup defaultValue="standard" className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
                        <Label htmlFor="standard" className="flex flex-col rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Truck className="mb-2 h-6 w-6"/>
                            Standard Delivery
                            <span className="text-sm text-muted-foreground">4-6 business days</span>
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="express" id="express" className="peer sr-only" />
                        <Label htmlFor="express" className="flex flex-col rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Truck className="mb-2 h-6 w-6 animate-pulse"/>
                            Express Delivery
                            <span className="text-sm text-muted-foreground">1-2 business days</span>
                        </Label>
                    </div>
                </RadioGroup>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>All transactions are secure and encrypted.</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup defaultValue="card" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <RadioGroupItem value="card" id="card" className="peer sr-only" />
                        <Label htmlFor="card" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <CreditCard className="mb-2 h-6 w-6" />
                            Credit Card
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="bank" id="bank" className="peer sr-only" />
                        <Label htmlFor="bank" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Landmark className="mb-2 h-6 w-6" />
                            Bank Transfer
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                        <Label htmlFor="cod" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                           <HandCoins className="mb-2 h-6 w-6" />
                           Pay on Delivery
                        </Label>
                    </div>
                </RadioGroup>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint="product image" />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">₦{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <p>Subtotal ({cartCount} items)</p>
                <p>₦{formatPrice(totalPrice)}</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping</p>
                <p>Free</p>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>₦{formatPrice(totalPrice)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Confirm Order</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
