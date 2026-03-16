'use client';

import { useState } from 'react';
import { MapPin, Plus, Star, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AddressForm } from '@/components/address/AddressForm';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useSetDefaultAddress,
  useDeleteAddress,
} from '@/lib/hooks/useAddresses';
import { Address, AddressRequest } from '@/types';
import { toast } from 'sonner';

export default function AddressesPage() {
  const { data: addresses = [], isLoading } = useAddresses();
  const { mutate: createAddress, isPending: creating } = useCreateAddress();
  const { mutate: updateAddress, isPending: updating } = useUpdateAddress();
  const { mutate: setDefault,    isPending: settingDefault } = useSetDefaultAddress();
  const { mutate: deleteAddress, isPending: deleting } = useDeleteAddress();

  const [showForm, setShowForm]       = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);

  const handleCreate = (data: AddressRequest) => {
    createAddress(data, {
      onSuccess: () => {
        toast.success('Address added');
        setShowForm(false);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? 'Failed to add address');
      },
    });
  };

  const handleUpdate = (data: AddressRequest) => {
    if (!editAddress) return;
    updateAddress(
      { id: editAddress.id, data },
      {
        onSuccess: () => {
          toast.success('Address updated');
          setEditAddress(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message ?? 'Failed to update address');
        },
      }
    );
  };

  const handleSetDefault = (id: number) => {
    setDefault(id, {
      onSuccess: () => toast.success('Default address updated'),
      onError:   () => toast.error('Failed to update default address'),
    });
  };

  const handleDelete = (id: number) => {
    deleteAddress(id, {
      onSuccess: () => toast.success('Address deleted'),
      onError:   () => toast.error('Failed to delete address'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">My Addresses</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your delivery addresses (max 5)
          </p>
        </div>
        {addresses.length < 5 && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && addresses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4 rounded-xl border bg-muted/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-semibold">No addresses saved</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add an address to speed up checkout
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Address
          </Button>
        </div>
      )}

      {/* Address grid */}
      {!isLoading && addresses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(address => (
            <div
              key={address.id}
              className={`
                relative rounded-xl border p-5 space-y-3 transition-all
                ${address.isDefault
                  ? 'border-primary/50 bg-primary/5 shadow-sm'
                  : 'bg-card hover:border-muted-foreground/30'
                }
              `}
            >
              {/* Title + default badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold text-sm">{address.title}</span>
                </div>
                {address.isDefault && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Default
                  </Badge>
                )}
              </div>

              {/* Address details */}
              <div className="text-sm space-y-1 text-muted-foreground pl-6">
                <p className="font-medium text-foreground">{address.fullName}</p>
                <p>{address.phone}</p>
                <p>{address.addressLine}</p>
                <p>{address.city}, {address.country}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t pl-6">
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => handleSetDefault(address.id)}
                    disabled={settingDefault}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setEditAddress(address)}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      disabled={deleting}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete address?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your "{address.title}" address.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(address.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add address dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <AddressForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isLoading={creating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit address dialog */}
      <Dialog open={!!editAddress} onOpenChange={() => setEditAddress(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          {editAddress && (
            <AddressForm
              initial={editAddress}
              onSubmit={handleUpdate}
              onCancel={() => setEditAddress(null)}
              isLoading={updating}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}