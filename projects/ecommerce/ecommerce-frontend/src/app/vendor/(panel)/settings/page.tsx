'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock, Eye, EyeOff, Loader2, Bell,
  CreditCard, Percent, AlertTriangle,
  CheckCircle, Info, Store,
} from 'lucide-react';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Label }     from '@/components/ui/label';
import { Badge }     from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch }    from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useVendorStore, useChangePassword } from '@/lib/hooks/useVendorStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Password schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword:     z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Payout schema
const payoutSchema = z.object({
  bankName:      z.string().min(2, 'Required'),
  accountName:   z.string().min(2, 'Required'),
  accountNumber: z.string().min(8, 'Required'),
  iban:          z.string().optional(),
  swiftCode:     z.string().optional(),
});

type PayoutFormValues = z.infer<typeof payoutSchema>;

export default function VendorSettingsPage() {
  const router              = useRouter();
  const { logout }          = useAuthStore();
  const { data: store }     = useVendorStore();
  const { mutate: changePw, isPending: changingPw } = useChangePassword();

  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  // Notification prefs (local state — extend to backend if needed)
  const [notifs, setNotifs] = useState({
    newOrder:    true,
    orderStatus: true,
    lowStock:    true,
    reviews:     false,
    payouts:     true,
  });

  // Password form
  const {
    register: regPw,
    handleSubmit: handlePwSubmit,
    watch: watchPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema) as any,
  });

  const newPw       = watchPw('newPassword', '');
  const strength    = [
    newPw.length >= 8,
    /[A-Z]/.test(newPw),
    /[0-9]/.test(newPw),
    /[^a-zA-Z0-9]/.test(newPw),
  ].filter(Boolean).length;
  const strengthColor = ['', 'bg-destructive', 'bg-orange-400',
                          'bg-yellow-400', 'bg-green-500'];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  // Payout form
  const {
    register: regPayout,
    handleSubmit: handlePayoutSubmit,
    formState: { errors: payoutErrors, isDirty: payoutDirty },
  } = useForm<PayoutFormValues>({
    resolver: zodResolver(payoutSchema) as any,
    defaultValues: {
      bankName: '', accountName: '',
      accountNumber: '', iban: '', swiftCode: '',
    },
  });

  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePw(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success('Password changed successfully');
          resetPw();
        },
        onError: (err: any) =>
          toast.error(err?.response?.data?.message ?? 'Failed to change password'),
      }
    );
  };

  const onPayoutSubmit = (data: PayoutFormValues) => {
    // TODO: wire to backend when payout endpoint is added
    toast.success('Payout info saved');
  };

  const handleCloseStore = () => {
    // TODO: wire to backend deactivate endpoint
    toast.info('Store closure requested — our team will contact you');
    setShowCloseDialog(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and vendor preferences
        </p>
      </div>

      {/* ── Commission (read-only) ── */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Percent className="h-4 w-4 text-primary" />
          Commission Rate
        </h2>
        <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div>
            <p className="font-semibold text-2xl text-primary">
              {store?.commissionRate ?? 10}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Platform takes this % from each delivered order
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Standard Rate
          </Badge>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          Commission is automatically deducted from your earnings.
          Contact support to discuss custom rates for high-volume sellers.
        </div>
      </div>

      {/* ── Payout info ── */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          Payout Information
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your bank details to receive weekly payouts
        </p>

        <form onSubmit={handlePayoutSubmit(onPayoutSubmit)}
          noValidate className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Bank Name *</Label>
              <Input placeholder="e.g. Chase Bank"
                {...regPayout('bankName')}
                className={payoutErrors.bankName ? 'border-destructive' : ''} />
              {payoutErrors.bankName && (
                <p className="text-xs text-destructive">
                  {payoutErrors.bankName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Account Holder Name *</Label>
              <Input placeholder="John Doe"
                {...regPayout('accountName')}
                className={payoutErrors.accountName ? 'border-destructive' : ''} />
              {payoutErrors.accountName && (
                <p className="text-xs text-destructive">
                  {payoutErrors.accountName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Account Number *</Label>
            <Input placeholder="000123456789"
              {...regPayout('accountNumber')}
              className={payoutErrors.accountNumber ? 'border-destructive' : ''} />
            {payoutErrors.accountNumber && (
              <p className="text-xs text-destructive">
                {payoutErrors.accountNumber.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>IBAN <span className="text-muted-foreground">(optional)</span></Label>
              <Input placeholder="GB29NWBK60161331926819"
                {...regPayout('iban')} />
            </div>
            <div className="space-y-1.5">
              <Label>SWIFT / BIC <span className="text-muted-foreground">(optional)</span></Label>
              <Input placeholder="CHASUS33"
                {...regPayout('swiftCode')} />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            Payouts are processed weekly every Monday for delivered orders
            from the previous week.
          </div>

          <Button type="submit" disabled={!payoutDirty} size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Payout Info
          </Button>
        </form>
      </div>

      {/* ── Password ── */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          Change Password
        </h2>

        <form onSubmit={handlePwSubmit(onPasswordSubmit)}
          noValidate className="space-y-4">

          {/* Current */}
          <div className="space-y-1.5">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                {...regPw('currentPassword')}
                className={`pr-10 ${pwErrors.currentPassword ? 'border-destructive' : ''}`}
              />
              <button type="button"
                onClick={() => setShowCurrent(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />
                }
              </button>
            </div>
            {pwErrors.currentPassword && (
              <p className="text-xs text-destructive">
                {pwErrors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New */}
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                {...regPw('newPassword')}
                className={`pr-10 ${pwErrors.newPassword ? 'border-destructive' : ''}`}
              />
              <button type="button"
                onClick={() => setShowNew(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />
                }
              </button>
            </div>
            {pwErrors.newPassword && (
              <p className="text-xs text-destructive">
                {pwErrors.newPassword.message}
              </p>
            )}
            {/* Strength indicator */}
            {newPw.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= strength
                          ? strengthColor[strength]
                          : 'bg-muted'
                      }`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Strength:{' '}
                  <span className="font-medium">
                    {strengthLabel[strength]}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div className="space-y-1.5">
            <Label>Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat new password"
                {...regPw('confirmPassword')}
                className={`pr-10 ${pwErrors.confirmPassword ? 'border-destructive' : ''}`}
              />
              <button type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />
                }
              </button>
            </div>
            {pwErrors.confirmPassword && (
              <p className="text-xs text-destructive">
                {pwErrors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" size="sm" disabled={changingPw}>
            {changingPw
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
              : <><CheckCircle className="mr-2 h-4 w-4" />Update Password</>
            }
          </Button>
        </form>
      </div>

      {/* ── Notifications ── */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Notification Preferences
        </h2>
        <div className="space-y-4">
          {[
            { key: 'newOrder',    label: 'New Orders',         sub: 'When a customer places an order'           },
            { key: 'orderStatus', label: 'Order Status Updates',sub: 'When order status changes'                },
            { key: 'lowStock',    label: 'Low Stock Alerts',   sub: 'When product stock drops below 5 units'   },
            { key: 'reviews',     label: 'New Reviews',        sub: 'When customers leave product reviews'     },
            { key: 'payouts',     label: 'Payout Notifications',sub: 'When payouts are processed'              },
          ].map(item => (
            <div key={item.key}
              className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
              <Switch
                checked={notifs[item.key as keyof typeof notifs]}
                onCheckedChange={val =>
                  setNotifs(prev => ({ ...prev, [item.key]: val }))
                }
              />
            </div>
          ))}
        </div>
        <Button size="sm" variant="outline"
          onClick={() => toast.success('Notification preferences saved')}>
          Save Preferences
        </Button>
      </div>

      {/* ── Danger zone ── */}
      <div className="rounded-xl border border-destructive/30 bg-card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </h2>
        <Separator className="border-destructive/20" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              Close Store
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Deactivate your vendor account. Your products will be
              unlisted and you will no longer receive orders. This can
              be reversed by contacting support.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/50 text-destructive hover:bg-destructive/10 shrink-0"
            onClick={() => setShowCloseDialog(true)}
          >
            Close Store
          </Button>
        </div>
      </div>

      {/* Close store dialog */}
      <AlertDialog
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close your store?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate your vendor account and unlist all your
              products. Existing orders will still be fulfilled. You can
              reactivate by contacting support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseStore}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Close Store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}