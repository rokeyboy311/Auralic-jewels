import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = (result as any).error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({
        success: false,
        error: `Validation error: ${errorMsg}`,
        details: (result as any).error.errors,
      });
    }
    req.body = result.data;
    next();
  };
}

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  idToken: z.string().optional(),
  credential: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
});

export const passwordForgotSchema = z.object({
  email: z.string().email('Valid email required'),
});

export const passwordResetSchema = z.object({
  token: z.string().min(10, 'Valid reset token required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const createOrderSchema = z.object({
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    stateOrProvince: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(2),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    stateOrProvince: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(2),
    phone: z.string().optional(),
  }).optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().nullable().optional(),
      quantity: z.number().int().positive(),
      size: z.string().optional(),
      engravingText: z.string().max(50).optional(),
    })
  ).min(1, 'At least one item required'),
  currency: z.string().default('USD'),
  shippingMethodId: z.string().optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['stripe', 'paypal', 'bank_wire', 'concierge_custom']).default('stripe'),
  notes: z.string().optional(),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(3),
  email: z.string().email(),
});

export const createConversationSchema = z.object({
  subject: z.string().min(2),
  type: z.enum(['concierge', 'bespoke', 'support', 'private_viewing']).default('concierge'),
  priority: z.enum(['low', 'standard', 'high', 'urgent', 'vip']).default('standard'),
  initialMessage: z.string().min(1),
  productId: z.string().optional(),
  productContext: z.any().optional(),
  orderId: z.string().optional(),
  orderContext: z.any().optional(),
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
  userPhone: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1),
  attachments: z.array(z.any()).optional(),
  isInternalNote: z.boolean().default(false),
  senderRole: z.string().optional(),
  senderName: z.string().optional(),
});

export const bespokeInquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  jewelleryType: z.string().min(2),
  metalPreference: z.string().optional(),
  stonePreference: z.string().optional(),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
  notes: z.string().min(5),
  inspirationImages: z.array(z.string()).optional(),
});

export const contactInquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(5),
  boutiqueLocation: z.string().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const couponValidateSchema = z.object({
  code: z.string().min(2),
  orderSubtotalUSD: z.number().nonnegative(),
});
