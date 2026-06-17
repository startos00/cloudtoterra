import { z } from 'zod'
import { NODE_TYPES, CONDITIONS, SOCIETY_TAGS, isValidSubType } from './taxonomy'

// A photo is either a remote http(s) URL or an inline base64 image the user
// uploaded from their device (downscaled client-side). Cap inline length so a
// row can't be bloated — production swaps these for object-storage URLs.
export const PHOTO_MAX_LEN = 1_500_000 // ~1.1 MB of binary once base64-decoded

export function isAcceptablePhoto(u: string): boolean {
  if (typeof u !== 'string' || u.length === 0 || u.length > PHOTO_MAX_LEN) return false
  try {
    const proto = new URL(u).protocol
    if (proto === 'http:' || proto === 'https:') return true
    if (proto === 'data:') return /^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(u)
    return false
  } catch {
    return false
  }
}

export const submissionSchema = z.object({
  type: z.enum([...NODE_TYPES]),
  subType: z.string(),
  condition: z.enum([...CONDITIONS]).optional(),
  nodeName: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  photoUrls: z
    .array(z.string().refine(isAcceptablePhoto, 'unsupported image'))
    .max(6)
    .optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  boundary: z.any().optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(120).optional(),
  societyTags: z.array(z.enum([...SOCIETY_TAGS])).optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
  contributorEmail: z.string().email().optional(),
  website: z.string().optional(), // honeypot — must be empty (checked in abuse.ts)
})
  .refine((v) => isValidSubType(v.type, v.subType), {
    message: 'sub_type does not match type', path: ['subType'],
  })
  .refine((v) => v.type !== 'land' || !!v.boundary, {
    message: 'land requires a drawn boundary', path: ['boundary'],
  })

export type Submission = z.infer<typeof submissionSchema>
