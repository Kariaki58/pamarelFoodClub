import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, ShoppingCart } from "lucide-react"

export function Footer() {
  const shopCategories = [
    { name: "Phones & Tablets", href: "/category?cat=phones-tablets" },
    { name: "Electronics", href: "/category?cat=electronics" },
    { name: "Fashion", href: "/category?cat=fashion" },
    { name: "Home & Office", href: "/category?cat=home-office" },
    { name: "Gaming", href: "/category?cat=gaming" },
    { name: "Health & Beauty", href: "/category?cat=health-beauty" },
  ];
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          
          {/* Column 1: Company Info */}
          <div className="space-y-6 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <ShoppingCart className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-white">pamarel</span>
            </Link>
            <p className="text-sm text-gray-400">Your one-stop shop for everything, delivering quality and convenience right to your doorstep.</p>
            {/* <div className="flex flex-col space-y-2">
                <Button variant="outline" className="justify-start text-left bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-6 w-6 shrink-0"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
                    <div>
                        <div className="text-xs">Download on the</div>
                        <div className="font-semibold">App Store</div>
                    </div>
                </Button>
                <Button variant="outline" className="justify-start text-left bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-6 w-6 shrink-0"><path d="M15.5 12.3 8.3 8c-.6-.4-1.3.1-1.3.8v8.5c0 .7.7 1.2 1.3.8l7.2-4.3c.6-.3.6-1.2 0-1.5z"/></svg>
                    <div>
                        <div className="text-xs">GET IT ON</div>
                        <div className="font-semibold">Google Play</div>
                    </div>
                </Button>
            </div> */}
          </div>
          
          {/* Column 2: Useful Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">LET US HELP YOU</h4>
            <ul className="space-y-2 text-sm">
              {/* <li><Link href="#" className="hover:underline">Help Center</Link></li> */}
              <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
              {/* <li><Link href="#" className="hover:underline">Shipping & Delivery</Link></li> */}
              {/* <li><Link href="#" className="hover:underline">Return Policy</Link></li> */}
              {/* <li><Link href="/report" className="hover:underline">Report a Product</Link></li> */}
               <li><Link href="/terms" className="hover:underline">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* Column 3: About pamarel */}
          {/* <div className="space-y-4">
            <h4 className="font-semibold text-white">ABOUT pamarel</h4>
            <ul className="space-y-2 text-sm">
               <li><Link href="#" className="hover:underline">About us</Link></li>
               <li><Link href="#" className="hover:underline">Careers</Link></li>
               <li><Link href="#" className="hover:underline">Privacy and Cookie Notice</Link></li>
            </ul>
          </div> */}
          
          {/* Column 4: Make Money */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">MAKE MONEY WITH pamarel</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/join-member" className="hover:underline">Become a club member</Link></li>
            </ul>
          </div>
          <div className="border-gray-700 flex flex-col md:flex-row items-center gap-8">
            {/* Newsletter section */}
            {/* <div className="w-full md:w-1/2 lg:w-1/3">
                <h4 className="font-semibold text-white">NEW TO pamarel?</h4>
                <p className="text-sm text-gray-400 mt-1 mb-3">Subscribe for exclusive offers and updates.</p>
                <form className="flex flex-col sm:flex-row gap-2">
                    <Input type="email" placeholder="Enter your email" className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-primary focus:border-primary" />
                    <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Subscribe</Button>
                </form>
            </div> */}
             <div className="w-full md:w-1/2 lg:w-2/3 md:pl-8">
                <h4 className="font-semibold text-white mb-3">JOIN US ON</h4>
                <div className="flex space-x-4">
                  <Link 
                    href="https://www.facebook.com/profile.php?id=61573028302471&mibextid=ZbWKwL" 
                    aria-label="Facebook" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Facebook className="h-6 w-6 hover:text-primary" />
                  </Link>

                  <Link 
                    href="https://www.instagram.com/pamarelfoodmarket?utm_source=qr&igsh=NWtkOWMxYzFra2Zh" 
                    aria-label="Instagram" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Instagram className="h-6 w-6 hover:text-primary" />
                  </Link>

                  {/* <Link href="#" aria-label="Twitter"><Twitter className="h-6 w-6 hover:text-primary" /></Link> */}

                  {/* <Link href="#" aria-label="YouTube"><Youtube className="h-6 w-6 hover:text-primary" /></Link> */}
                </div>
            </div>
        </div>
        </div>

        

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
            <p className="text-sm order-2 sm:order-1">&copy; {new Date().getFullYear()} pamarel. All rights reserved.</p>
            <div className="flex items-center space-x-4 order-1 sm:order-2">
                <span className="font-semibold text-sm">Payment Methods:</span>
                <span className="text-sm font-mono">Paystack</span>
                <span className="text-sm font-mono">Wallet Transfer</span>
            </div>
        </div>
      </div>
    </footer>
  )
}
