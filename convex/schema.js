import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  hotels: defineTable({
    customId: v.optional(v.string()),
    name: v.string(),
    location: v.string(),
    region: v.string(),
    category: v.string(),
    price: v.number(),
    originalPrice: v.number(),
    discount: v.number(),
    images: v.array(v.string()),
    tag: v.optional(v.string()),
    isMain: v.optional(v.boolean()),
    desc: v.optional(v.string()),
    benefit: v.optional(v.string()),
    source: v.optional(v.string()),
    rating: v.optional(v.number()),
  }).index("by_category", ["category"]).index("by_region", ["region"]).index("by_customId", ["customId"]),

  coupons: defineTable({
    code: v.string(),
    couponNumber: v.number(),
    status: v.string(), // "available", "assigned", "used"
    assignedTo: v.optional(v.string()),
    assignedPhone: v.optional(v.string()),
    assignedDate: v.optional(v.string()),
    usedDate: v.optional(v.string()),
    usedFor: v.optional(v.string()),
  }).index("by_code", ["code"]).index("by_status", ["status"]),

  reservations: defineTable({
    hotelId: v.optional(v.string()),
    hotelName: v.string(),
    userName: v.string(),
    userPhone: v.string(),
    couponCode: v.string(),
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.number(),
    status: v.string(), // "pending", "confirmed", "cancelled"
    requestMemo: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userPhone", ["userPhone"]).index("by_status", ["status"]),

  inquiries: defineTable({
    name: v.string(),
    phone: v.string(),
    title: v.string(),
    content: v.string(),
    status: v.string(), // "waiting", "answered"
    reply: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_phone", ["phone"]).index("by_status", ["status"]),
});
