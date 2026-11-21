import { c as createSsrRpc } from "./router-CkmTURa-.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { o as objectType, s as stringType, a as arrayType, e as enumType, l as literalType } from "../_libs/zod.mjs";
const questionSchema = objectType({
  requestId: stringType().uuid().default(() => crypto.randomUUID()),
  question: stringType().trim().min(1).max(900),
  context: objectType({
    kind: enumType(["design", "signal", "finance"]),
    id: stringType().regex(/^[a-zA-Z0-9_-]{1,80}$/)
  }).optional(),
  history: arrayType(objectType({
    role: enumType(["user", "assistant"]),
    content: stringType().max(1500)
  })).max(8).default([])
});
const askAiSuviet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((value) => questionSchema.parse(value)).handler(createSsrRpc("ca55cf1eaa78cf9ebaf6a35993f5c91db16890425e33bec763eff69caa7f7f0e"));
const extractAiPdf = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((value) => objectType({
  id: stringType().uuid()
}).parse(value)).handler(createSsrRpc("5ee6546e38af844b2fd8483e00a5714138c7eeb6aa5c00a5b52b2b6cf93cfd3f"));
const getAiSuvietAvailability = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("9bffbba303463c9a97b3403b0ffa83cb188f7169e03ce0b47f495771351442c0"));
const getAiSuvietConfiguration = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("66109454756f230b9fcf3a8b3f67f7423027305f5d529d751816015bac284620"));
const testAiSuvietConnection = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("3f1431998d0c90dd5cfc89d9f8f607520a42cdce80c80037b6058e0c93bf8ecc"));
const saveAiSuvietKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((value) => objectType({
  key: stringType().trim().min(20).max(500)
}).parse(value)).handler(createSsrRpc("baf5a8f71ea1c10c552fe327489bd561ef08469c0ea51c28f617c1cd8f7a8c7d"));
const getAiPersonalMemory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((value) => objectType({
  scope: stringType().min(1).max(100).default("general")
}).parse(value)).handler(createSsrRpc("15271aa2d196f2426a6cfe336fd62dd06b4fdd6ece3f467293910507a384a1d2"));
const editAiPersonalMemory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((value) => objectType({
  id: stringType().uuid(),
  content: stringType().trim().min(1).max(600)
}).parse(value)).handler(createSsrRpc("841d1c5eda6051b4497c8abdd8e46ed901d19ad69d1e62277be85dd9f9098b65"));
const forgetAiPersonalMemory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((value) => objectType({
  id: stringType().uuid().nullable(),
  confirmation: literalType("QUEN")
}).parse(value)).handler(createSsrRpc("d494b04609645b6d30de3317d5fe8e03532a73573fd6b2b13fb43f7a2b517bf1"));
export {
  askAiSuviet as a,
  getAiSuvietAvailability as b,
  extractAiPdf as c,
  getAiSuvietConfiguration as d,
  editAiPersonalMemory as e,
  forgetAiPersonalMemory as f,
  getAiPersonalMemory as g,
  saveAiSuvietKey as s,
  testAiSuvietConnection as t
};
