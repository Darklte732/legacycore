'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'

// Schema for commission rate validation
const formSchema = z.object({
  carrier: z.string().min(1, { message: 'Carrier is required' }),
  product_type: z.string().min(1, { message: 'Product type is required' }),
  policy_year: z.coerce.number().min(1, { message: 'Policy year must be at least 1' }),
  rate_percentage: z.coerce.number()
    .min(0, { message: 'Rate must be 0 or greater' })
    .max(100, { message: 'Rate cannot exceed 100%' }),
  min_face_amount: z.coerce.number().nullable(),
  max_face_amount: z.coerce.number().nullable(),
  effective_date: z.date({ required_error: 'Effective date is required' }),
  expiration_date: z.date().nullable(),
  notes: z.string().nullable(),
}).refine(data => {
  // If both min and max face amounts are provided, ensure min <= max
  if (data.min_face_amount != null && data.max_face_amount != null) {
    return data.min_face_amount <= data.max_face_amount;
  }
  return true;
}, {
  message: 'Minimum face amount must be less than or equal to maximum face amount',
  path: ['min_face_amount'],
});

// Props interface for CommissionRateForm
interface CommissionRateFormProps {
  rateData?: any
  existingCarriers: string[]
  onSave: (data: any) => void
  onCancel: () => void
}

export function CommissionRateForm({
  rateData,
  existingCarriers,
  onSave,
  onCancel
}: CommissionRateFormProps) {
  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carrier: rateData?.carrier || '',
      product_type: rateData?.product_type || '',
      policy_year: rateData?.policy_year || 1,
      rate_percentage: rateData?.rate_percentage || 0,
      min_face_amount: rateData?.min_face_amount || null,
      max_face_amount: rateData?.max_face_amount || null,
      effective_date: rateData?.effective_date 
        ? new Date(rateData.effective_date) 
        : new Date(),
      expiration_date: rateData?.expiration_date 
        ? new Date(rateData.expiration_date) 
        : null,
      notes: rateData?.notes || '',
    },
  })

  // Common product types for autocomplete
  const commonProductTypes = [
    'Term Life',
    'Whole Life',
    'Universal Life',
    'Variable Life',
    'Indexed Universal Life',
    'Final Expense',
    'Guaranteed Issue',
    'Accidental Death',
    'Group Life',
    'Critical Illness',
    'Disability',
    'Medicare Supplement',
    'Medicare Advantage',
    'Dental & Vision',
    'Long Term Care'
  ]

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Format dates for the API
    const formattedValues = {
      ...values,
      effective_date: format(values.effective_date, 'yyyy-MM-dd'),
      expiration_date: values.expiration_date 
        ? format(values.expiration_date, 'yyyy-MM-dd') 
        : null,
    }
    onSave(formattedValues)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carrier */}
          <FormField
            control={form.control}
            name="carrier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carrier</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {existingCarriers.length > 0 ? (
                      existingCarriers.map(carrier => (
                        <SelectItem key={carrier} value={carrier}>
                          {carrier}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="AIG">AIG</SelectItem>
                        <SelectItem value="Americo">Americo</SelectItem>
                        <SelectItem value="Aetna">Aetna</SelectItem>
                        <SelectItem value="Gerber">Gerber</SelectItem>
                        <SelectItem value="Mutual of Omaha">Mutual of Omaha</SelectItem>
                        <SelectItem value="Transamerica">Transamerica</SelectItem>
                        <SelectItem value="MetLife">MetLife</SelectItem>
                        <SelectItem value="Prudential">Prudential</SelectItem>
                        <SelectItem value="New York Life">New York Life</SelectItem>
                        <SelectItem value="State Farm">State Farm</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Product Type */}
          <FormField
            control={form.control}
            name="product_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {commonProductTypes.map(productType => (
                      <SelectItem key={productType} value={productType}>
                        {productType}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Policy Year */}
          <FormField
            control={form.control}
            name="policy_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormDescription>
                  Year of the policy for this commission rate (1 for first year, etc.)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rate Percentage */}
          <FormField
            control={form.control}
            name="rate_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commission Rate (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min={0} 
                    max={100} 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Percentage of premium as commission (e.g. 85 for 85%)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Min Face Amount */}
          <FormField
            control={form.control}
            name="min_face_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Face Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    placeholder="Optional" 
                    {...field} 
                    value={field.value || ''} 
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseInt(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Minimum policy face amount for this rate to apply (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Max Face Amount */}
          <FormField
            control={form.control}
            name="max_face_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Face Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    placeholder="Optional" 
                    {...field} 
                    value={field.value || ''} 
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseInt(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Maximum policy face amount for this rate to apply (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Effective Date */}
          <FormField
            control={form.control}
            name="effective_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Effective Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Select effective date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Date when this rate becomes effective
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expiration Date */}
          <FormField
            control={form.control}
            name="expiration_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiration Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>No expiration</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => date < form.getValues('effective_date')}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Optional date when this rate expires
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional information about this commission rate" 
                  {...field} 
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {rateData ? 'Update Commission Rate' : 'Create Commission Rate'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 