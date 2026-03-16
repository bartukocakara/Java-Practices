'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShoppingBag, CreditCard, Truck, MapPin,
  Phone, User, FileText, Loader2, ChevronRight
} from 'lucide-react';
import { Button }       from '@/components/ui/button';
import { Input }        from '@/components/ui/input';
import { Label }        from '@/components/ui/label';
import { Separator }    from '@/components/ui/separator';
import { Textarea }     from '@/components/ui/textarea';
import { Badge }        from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart }        from '@/lib/hooks/useCart';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { useAddresses }   from '@/lib/hooks/useAddresses';
import { useAuthStore }   from '@/store/authStore';
import { useCartStore }   from '@/store/cartStore';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  fullName:      z.string().min(2, 'Full name is required').max(100),
  phone:         z.string().min(7, 'Valid phone number is required').max(20),
  addressLine:   z.string().min(5, 'Address is required').max(255),
  city:          z.string().min(2, 'City is required').max(100),
  country:       z.string().min(2, 'Country is required').max(100),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'CREDIT_CARD']),
  notes:         z.string().max(500).optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const fmt = (val: number | undefined | null) => (val ?? 0).toFixed(2);

export default function CheckoutPage() {
  const router                    = useRouter();
  const { isAuthenticated }       = useAuthStore();
  const { clearCart }             = useCartStore();
  const { data: cart, isLoading } = useCart();
  const { data: addresses = [] }  = useAddresses();
  const { mutate: createOrder, isPending } = useCreateOrder();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'CASH_ON_DELIVERY',
      country: 'Turkey',
    },
  });

  const paymentMethod = watch('paymentMethod');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  // Auto-fill from default address
  const defaultAddress = addresses.find(a => a.isDefault);
  useEffect(() => {
    if (defaultAddress) {
      setValue('fullName',    defaultAddress.fullName);
      setValue('phone',       defaultAddress.phone);
      setValue('addressLine', defaultAddress.addressLine);
      setValue('city',        defaultAddress.city);
      setValue('country',     defaultAddress.country);
    }
  }, [defaultAddress, setValue]);

  const fillFromAddress = (addressId: number) => {
    const address = addresses.find(a => a.id === addressId);
    if (!address) return;
    setValue('fullName',    address.fullName,    { shouldValidate: true });
    setValue('phone',       address.phone,       { shouldValidate: true });
    setValue('addressLine', address.addressLine, { shouldValidate: true });
    setValue('city',        address.city,        { shouldValidate: true });
    setValue('country',     address.country,     { shouldValidate: true });
  };

  const items      = cart?.items ?? [];
  const subtotal   = cart?.totalAmount ?? 0;
  const shipping   = subtotal >= 50 ? 0 : 9.99;
  const tax        = subtotal * 0.08;
  const orderTotal = subtotal + shipping + tax;

  const onSubmit = (data: CheckoutForm) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    createOrder(
      {
        ...data,
        notes: data.notes || undefined,
        items: items.map(i => ({
          productId: i.productId,
          quantity:  i.quantity,
        })),
      },
      {
        onSuccess: (order) => {
          clearCart();
          toast.success('Order placed successfully!');
          router.push(`/profile/orders/${order.id}`);
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message ?? 'Failed to place order';
          toast.error(message);
        },
      }
    );
  };

  if (!isAuthenticated || isLoading) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">

      {/* Breadcrumb */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/cart" className="hover:text-foreground transition-colors">Cart</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Checkout</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Form ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Shipping Info */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                  1
                </div>
                <h2 className="text-lg font-semibold">Shipping Information</h2>
              </div>

              {/* Saved address quick-fill */}
              {addresses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Fill from saved address
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {addresses.map(addr => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => fillFromAddress(addr.id)}
                        className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <MapPin className="h-3 w-3 text-primary" />
                        {addr.title}
                        {addr.isDefault && (
                          <span className="text-yellow-500 text-[10px]">★</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <Separator />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="flex items-center gap-1.5 text-sm">
                    <User className="h-3 w-3" /> Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register('fullName')}
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm">
                    <Phone className="h-3 w-3" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+90 555 000 0000"
                    {...register('phone')}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                {/* Address Line */}
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="addressLine" className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3 w-3" /> Address
                  </Label>
                  <Input
                    id="addressLine"
                    placeholder="123 Main Street, Apt 4B"
                    {...register('addressLine')}
                    className={errors.addressLine ? 'border-destructive' : ''}
                  />
                  {errors.addressLine && (
                    <p className="text-xs text-destructive">{errors.addressLine.message}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm">City</Label>
                  <Input
                    id="city"
                    placeholder="Istanbul"
                    {...register('city')}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city.message}</p>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-sm">Country</Label>
                  <Input
                    id="country"
                    placeholder="Turkey"
                    {...register('country')}
                    className={errors.country ? 'border-destructive' : ''}
                  />
                  {errors.country && (
                    <p className="text-xs text-destructive">{errors.country.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="notes" className="flex items-center gap-1.5 text-sm">
                    <FileText className="h-3 w-3" />
                    Order Notes
                    <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for delivery..."
                    rows={2}
                    {...register('notes')}
                  />
                </div>

                {/* Save address hint */}
                {addresses.length === 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">
                      💡 You can save addresses for faster checkout in{' '}
                      <Link
                        href="/profile/addresses"
                        className="text-primary hover:underline font-medium"
                      >
                        My Addresses
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                  2
                </div>
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(val) =>
                  setValue('paymentMethod', val as 'CASH_ON_DELIVERY' | 'CREDIT_CARD')
                }
                className="space-y-3"
              >
                {/* Cash on Delivery */}
                <div className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40'
                }`}>
                  <RadioGroupItem value="CASH_ON_DELIVERY" id="cod" />
                  <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 shrink-0">
                      <Truck className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">Free</Badge>
                  </Label>
                </div>

                {/* Credit Card */}
                <div className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40'
                }`}>
                  <RadioGroupItem value="CREDIT_CARD" id="cc" />
                  <Label htmlFor="cc" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Credit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">Secure</Badge>
                  </Label>
                </div>
              </RadioGroup>

              {/* Credit card fields */}
              {paymentMethod === 'CREDIT_CARD' && (
                <div className="p-4 rounded-xl bg-muted/50 space-y-3 border">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Card Number</Label>
                    <Input placeholder="1234 5678 9012 3456" maxLength={19} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Expiry</Label>
                      <Input placeholder="MM/YY" maxLength={5} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">CVV</Label>
                      <Input placeholder="123" maxLength={4} type="password" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Name on Card</Label>
                    <Input placeholder="John Doe" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    🔒 Your card details are encrypted and secure
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card p-6 space-y-4 sticky top-24">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                  3
                </div>
                <h2 className="text-lg font-semibold">Order Summary</h2>
              </div>

              {/* Items list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.cartItemId} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0 text-xs font-bold text-muted-foreground">
                      {item.quantity}×
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        ${fmt(item.unitPrice)} each
                      </p>
                    </div>
                    <span className="text-xs font-semibold shrink-0">
                      ${fmt(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">${fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span className="text-foreground">${fmt(shipping)}</span>
                  )}
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span className="text-foreground">${fmt(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary text-lg">${fmt(orderTotal)}</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isPending || items.length === 0}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Place Order · ${fmt(orderTotal)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                By placing your order you agree to our{' '}
                <span className="underline cursor-pointer hover:text-foreground transition-colors">
                  Terms of Service
                </span>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}