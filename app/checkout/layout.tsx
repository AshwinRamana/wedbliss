import CheckoutShell from '@/components/checkout/CheckoutShell';
import './checkout.css';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <CheckoutShell>{children}</CheckoutShell>;
}
