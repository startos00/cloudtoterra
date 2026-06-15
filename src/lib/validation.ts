import { z } from 'zod'
import { NODE_TYPES, CONDITIONS, SOCIETY_TAGS, isValidSubType } from './taxonomy'

export const submissionSchema = z.object({
  type: z.enum([...NODE_TYPES]),
  subType: z.string(),
  condition: z.enum([...CONDITIONS]).optional(),
  nodeName: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  photoUrls: z.array(z.string().url()).max(6).optional(),
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
