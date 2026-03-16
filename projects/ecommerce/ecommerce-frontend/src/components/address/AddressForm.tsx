'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Address, AddressRequest } from '@/types';

const schema = z.object({
  title:       z.string().min(1, 'Title is required').max(50),
  fullName:    z.string().min(2, 'Full name is required').max(100),
  phone:       z.string().min(7, 'Valid phone is required').max(20),
  addressLine: z.string().min(5, 'Address is required').max(255),
  city:        z.string().min(2, 'City is required').max(100),
  country:     z.string().min(2, 'Country is required').max(100),
  isDefault:   z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initial?:   Address;
  onSubmit:   (data: AddressRequest) => void;
  onCancel:   () => void;
  isLoading?: boolean;
}

export function AddressForm({ initial, onSubmit, onCancel, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       '',
      fullName:    '',
      phone:       '',
      addressLine: '',
      city:        '',
      country:     'Turkey',
      isDefault:   false,
    },
  });

  const isDefault = watch('isDefault');

  useEffect(() => {
    if (initial) {
      reset({
        title:       initial.title,
        fullName:    initial.fullName,
        phone:       initial.phone,
        addressLine: initial.addressLine,
        city:        initial.city,
        country:     initial.country,
        isDefault:   initial.isDefault,
      });
    }
  }, [initial, reset]);

  const Field = ({
    id, label, placeholder, error, ...rest
  }: {
    id: keyof FormData;
    label: string;
    placeholder: string;
    error?: string;
    [key: string]: any;
  }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <Input
        id={id}
        placeholder={placeholder}
        {...register(id as any)}
        className={error ? 'border-destructive' : ''}
        {...rest}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field
        id="title"
        label="Address Title"
        placeholder="e.g. Home, Work, Parents"
        error={errors.title?.message}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="fullName"
          label="Full Name"
          placeholder="John Doe"
          error={errors.fullName?.message}
        />
        <Field
          id="phone"
          label="Phone"
          placeholder="+90 555 000 0000"
          error={errors.phone?.message}
        />
      </div>

      <Field
        id="addressLine"
        label="Address"
        placeholder="123 Main Street, Apt 4B"
        error={errors.addressLine?.message}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="city"
          label="City"
          placeholder="Istanbul"
          error={errors.city?.message}
        />
        <Field
          id="country"
          label="Country"
          placeholder="Turkey"
          error={errors.country?.message}
        />
      </div>

      {/* Default toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
        <div>
          <p className="text-sm font-medium">Set as default address</p>
          <p className="text-xs text-muted-foreground">
            Used automatically at checkout
          </p>
        </div>
        <Switch
          checked={isDefault}
          onCheckedChange={val => setValue('isDefault', val)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initial ? 'Save Changes' : 'Add Address'}
        </Button>
      </div>
    </form>
  );
}