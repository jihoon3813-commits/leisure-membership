import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 관리자 계정 목록 조회
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("admins").collect();
  },
});

// 관리자 단일 조회 (로그인 검증용)
export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.username.trim().toLowerCase()))
      .first();
  },
});

// 관리자 계정 생성
export const create = mutation({
  args: {
    id: v.string(),
    username: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.string(),
    roleName: v.string(),
    department: v.string(),
    phone: v.string(),
    email: v.string(),
    status: v.string(),
    createdAt: v.string(),
    lastLogin: v.optional(v.string()),
    memo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.username.toLowerCase()))
      .first();
    if (existing) throw new Error("이미 존재하는 관리자 아이디입니다.");
    return await ctx.db.insert("admins", {
      ...args,
      username: args.username.toLowerCase(),
    });
  },
});

// 관리자 정보 수정
export const update = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    department: v.optional(v.string()),
    role: v.optional(v.string()),
    roleName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(v.string()),
    password: v.optional(v.string()),
    memo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admins = await ctx.db.query("admins").collect();
    const target = admins.find((a) => a.id === args.id || a._id === args.id);
    if (!target) throw new Error("관리자 계정을 찾을 수 없습니다.");
    const { id, ...fields } = args;
    await ctx.db.patch(target._id, fields);
    return { success: true };
  },
});

// 관리자 삭제
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const admins = await ctx.db.query("admins").collect();
    const target = admins.find((a) => a.id === args.id || a._id === args.id);
    if (!target) throw new Error("관리자 계정을 찾을 수 없습니다.");
    await ctx.db.delete(target._id);
    return { success: true };
  },
});

// 감사 로그 목록 조회
export const listLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("adminLogs").order("desc").take(100);
  },
});

// 감사 로그 추가
export const addLog = mutation({
  args: {
    id: v.string(),
    adminId: v.string(),
    adminName: v.string(),
    action: v.string(),
    actionName: v.string(),
    details: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("adminLogs", args);
    return { success: true };
  },
});

// 감사 로그 초기화
export const clearLogs = mutation({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("adminLogs").collect();
    for (const l of logs) {
      await ctx.db.delete(l._id);
    }
    return { count: logs.length };
  },
});
