// lib/validation.ts
import { z } from 'zod';
import {
  LISTING_MAX_IMAGES,
  LISTING_MAX_TAGS,
  LISTING_MIN_PRICE,
  LISTING_MAX_PRICE,
} from './constants';

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name is required'),
  country: z.string().min(2),
});

export const sellerProfileSchema = z.object({
  real_name: z.string().min(2),
  business_name: z.string().min(2),
  whatsapp: z.string().min(10).max(20),
  based_country: z.string().min(2),
  based_region: z.string().optional(),
  based_city: z.string().optional(),
  primary_categories: z.array(z.string()).max(3),
});

export const listingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  price: z.number().min(LISTING_MIN_PRICE).max(LISTING_MAX_PRICE),
  currency: z.string().default('NGN'),
  price_negotiable: z.boolean().default(false),
  category_id: z.string().uuid(),
  location: z.string().max(200).optional(),
  images: z.array(z.string()).min(1).max(LISTING_MAX_IMAGES),
  tags: z.array(z.string()).max(LISTING_MAX_TAGS).default([]),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional(),
});

export const reviewReplySchema = z.object({
  reply: z.string().min(1).max(1000),
});

export const reportSchema = z.object({
  target_type: z.enum(['listing', 'seller', 'buyer', 'review']),
  target_id: z.string().uuid(),
  reason: z.string().min(1),
  details: z.string().max(1000).optional(),
});

export const paymentSchema = z.object({
  reference: z.string().min(3),
  amount: z.number().positive(),
  currency: z.string(),
  screenshot_url: z.string().url(),
  claimed_ref: z.string().optional(),
});

export const locationSchema = z.object({
  country: z.string().min(2),
  region: z.string().optional(),
  city: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});