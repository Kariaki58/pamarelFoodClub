import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/context/cart-provider';


export default function HomeLayout({ children }) {
    return (
        <CartProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
        </CartProvider>
    )
}