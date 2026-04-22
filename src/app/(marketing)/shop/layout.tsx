import { ShopCartProvider } from "@/modules/shop/components/shop-cart-provider";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ShopCartProvider>{children}</ShopCartProvider>;
}
