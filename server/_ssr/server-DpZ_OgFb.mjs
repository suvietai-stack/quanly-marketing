import { AsyncLocalStorage } from "node:async_hooks";
import { H as H3Event, t as toResponse } from "../_libs/h3-v2.mjs";
import { z as defineHandlerCallback, A as resolveManifestAssetLink, s as resolveManifestCssLink, j as rootRouteId, C as getNormalizedURL, w as waitForReason, D as isPromise, E as normalizeSsrResponse, F as attachRouterServerSsrUtils, G as _getRenderedMatches, H as stripSsrResponseBody, I as bindSsrResponseToRequest, J as createSerializationAdapter, i as invariant, e as isNotFound, K as isRedirect, L as mergeHeaders, M as executeRewriteInput, a as isDangerousProtocol, N as replaceSsrResponse, O as isSsrResponse, P as disposeSsrResponse, Q as makeSerovalPlugin, p as getScriptPreloadAttrs, S as getStylesheetHref, T as createRawStreamRPCPlugin, U as parseRedirect, V as defaultSerovalDeserializerPlugins } from "../_libs/tanstack__router-core.mjs";
import { f as fromJSON, t as toCrossJSONAsync, d as toCrossJSONStream } from "../_libs/seroval.mjs";
import { c as createServerHistory } from "../_libs/tanstack__history.mjs";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { r as renderRouterToStream, R as RouterProvider } from "../_libs/tanstack__react-router.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
function StartServer(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RouterProvider, { router: props.router });
}
var defaultStreamHandler = defineHandlerCallback(({ request, router, responseHeaders }) => renderRouterToStream({
  request,
  router,
  responseHeaders,
  children: /* @__PURE__ */ jsxRuntimeExports.jsx(StartServer, { router })
}));
var GLOBAL_EVENT_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:event-storage");
var globalObj$1 = globalThis;
if (!globalObj$1[GLOBAL_EVENT_STORAGE_KEY]) globalObj$1[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
var eventStorage = globalObj$1[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
  return (typeof value === "object" || typeof value === "function") && value !== null && typeof value.then === "function";
}
function getSetCookieValues(headers) {
  const headersWithSetCookie = headers;
  if (typeof headersWithSetCookie.getSetCookie === "function") return headersWithSetCookie.getSetCookie();
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
  if (response.ok) return;
  const eventSetCookies = getSetCookieValues(event.res.headers);
  if (eventSetCookies.length === 0) return;
  const responseSetCookies = getSetCookieValues(response.headers);
  response.headers.delete("set-cookie");
  for (const cookie of responseSetCookies) response.headers.append("set-cookie", cookie);
  for (const cookie of eventSetCookies) response.headers.append("set-cookie", cookie);
}
function finalizeResponse(value, event) {
  const response = ensureResponse(value);
  mergeEventResponseHeaders(response, event);
  return response;
}
function finalizeMaybeResponse(value, event) {
  if (isPromiseLike(value)) return Promise.resolve(value).then((resolved) => finalizeResponse(resolved, event), (error) => finalizeResponse(handleResponseError(error), event));
  return finalizeResponse(value, event);
}
function ensureResponse(value) {
  if (value instanceof Response) return value;
  return new Response("Internal Server Error", { status: 500 });
}
function handleResponseError(error) {
  if (error instanceof Response) return error;
  if (error instanceof Error) throw error;
  return new Response("Internal Server Error", { status: 500 });
}
function requestHandler(handler) {
  return (request, requestOpts) => {
    let h3Event;
    try {
      h3Event = new H3Event(request);
    } catch (error) {
      if (error instanceof URIError) return new Response(null, {
        status: 400,
        statusText: "Bad Request"
      });
      throw error;
    }
    let response;
    try {
      response = eventStorage.run({ h3Event }, () => handler(request, requestOpts));
    } catch (error) {
      response = handleResponseError(error);
    }
    return toResponse(finalizeMaybeResponse(response, h3Event), h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) throw new Error(`No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return event.h3Event;
}
function getRequest() {
  return getH3Event().req;
}
function getResponse() {
  return getH3Event().res;
}
var HEADERS = { TSS_SHELL: "X-TSS_SHELL" };
async function getStartManifest(matchedRoutes) {
  const { tsrStartManifest } = await import("../_tanstack-start-manifest_v-DcYRnJv4.mjs");
  const startManifest = tsrStartManifest();
  let routes = startManifest.routes;
  routes[rootRouteId];
  const manifestRoutes = {};
  for (const k in routes) {
    const v = routes[k];
    const result = {};
    if (v.preloads && v.preloads.length > 0) result.preloads = v.preloads;
    if (v.scripts && v.scripts.length > 0) result.scripts = v.scripts;
    if (v.css?.length) result.css = v.css;
    if (result.preloads || result.scripts || result.css) manifestRoutes[k] = result;
  }
  return {
    ...startManifest.scriptFormat ? { scriptFormat: startManifest.scriptFormat } : {},
    ...startManifest.inlineCss ? { inlineCss: startManifest.inlineCss } : {},
    routes: manifestRoutes
  };
}
const manifest = {
  "0113de71819f21b546487ac041152e9ccd682d9020f7a79cc23481e9ead65686": {
    functionName: "accountAuthStatus_createServerFn_handler",
    importer: () => import("./accounts.functions-qhVdLijt.mjs")
  },
  "03caa914b26cd5697651f3e13df399d71200c4d62bc7d1f969687ba4e1004513": {
    functionName: "getPublicBranding_createServerFn_handler",
    importer: () => import("./branding.functions-Bxwmvj9R.mjs")
  },
  "0a42b1cb005cd29f8efb7fa5122273131b5a0974b83df3e4ba31d2df4eb193a0": {
    functionName: "frGroupHistory_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-Ds_gGyUq.mjs")
  },
  "0a9958c9f742ed40bc01579fd71097067f1204c8c489531d525fc2c551124c6d": {
    functionName: "k3ReportGroups_createServerFn_handler",
    importer: () => import("./k3Automation.functions-BxMvmnU_.mjs")
  },
  "0b2cbaddbab67da314f73654234222290becd59c1e05d1c6cbce3788f63e3641": {
    functionName: "designGroupHistory_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BRMGmx2S.mjs")
  },
  "0c4a065752acd0ded8809738ee29ab185555dfe4bab2f41c61839887af1be525": {
    functionName: "resendConfirmation_createServerFn_handler",
    importer: () => import("./accounts.functions-qhVdLijt.mjs")
  },
  "0ed236a9ba66a1e2f9a4222d5a41568408815d48f9a175cf18ee0706ccf208ef": {
    functionName: "designGroupListGroups_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BRMGmx2S.mjs")
  },
  "129b708f6dfc9435972772129a5b5c1bd085bc63e4521ca4c9beb7ab336d1053": {
    functionName: "designGroupSave_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BRMGmx2S.mjs")
  },
  "12b464f21a04a62630aac68a95fc0d3c2eb17e8878b5e5b797f1a228e6e178e2": {
    functionName: "zaloUnlink_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "131b0a4b0abf3b73f8dd79b796c48614b49ec5a392c5e2b994a397344cecbe55": {
    functionName: "fblConnectUrl_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "15271aa2d196f2426a6cfe336fd62dd06b4fdd6ece3f467293910507a384a1d2": {
    functionName: "getAiPersonalMemory_createServerFn_handler",
    importer: () => import("./assistant.functions-CGXlY8yQ.mjs")
  },
  "1545822d234fc398f8ce7f7d948aa060c23ad567823532f5338a7449698764d2": {
    functionName: "fblPageFeatures_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "16de56824ea7268e1f76e54ca69ff2587db3a32e7cb453d35dde652edd166f63": {
    functionName: "zaloSetAuto_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "17bfdffe40cedefe0ad429ae903ee7cd69d0e3ad80f99498390ca7ab41b73078": {
    functionName: "chatLocate_createServerFn_handler",
    importer: () => import("./chat.functions-B56Uv_kL.mjs")
  },
  "17d5b2afa0c66de4802bf679f33cb4ff50953e4feaf65760e3af6a8d9b4a7254": {
    functionName: "frGroupSendTest_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-Ds_gGyUq.mjs")
  },
  "199dee88cf0bf496bc4d50ede94b8f59553c2652ba210d7a3a6e647bf693bdf5": {
    functionName: "gmfRetry_createServerFn_handler",
    importer: () => import("./gmf.functions-BmLLghjg.mjs")
  },
  "1b506d2c3f2bbc9564de17807445bce0f0371dc2d15afdfae05b2ee1d5ec5139": {
    functionName: "leaveGroupSave_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BQMdg21-.mjs")
  },
  "1c1631db9b5eddf142368f53bfce1e0be2764a4f225c30be7227d946837ee464": {
    functionName: "usernameSignIn_createServerFn_handler",
    importer: () => import("./accounts.functions-qhVdLijt.mjs")
  },
  "1e3417caefaba9ee5e6e4f307982ad98cab530e1586988ce3e116ea7a04a1064": {
    functionName: "chatSaveSite_createServerFn_handler",
    importer: () => import("./chat.functions-B56Uv_kL.mjs")
  },
  "234e9b6a814fe9ec34c9ed25f50d7d4fa92f0ed2195e7d121c29da9f799a6995": {
    functionName: "zaloCareGet_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "2457f5b28011522a725a25f2560a17be6d90c45631296e05e17229ec9bfe1735": {
    functionName: "fblEvents_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "290871761ddd013f2f7d9d8aa23a14427c54aece80c97845d581691122aac8b4": {
    functionName: "leaveGroupListGroups_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BQMdg21-.mjs")
  },
  "3002c612923103f9023be94a38ef97ad2828bc1497cd878c69adf016265fe5cf": {
    functionName: "wfSaveForm_createServerFn_handler",
    importer: () => import("./wf.functions-CyhrH8V_.mjs")
  },
  "30ff5f0927f0ea26babdd9eaa2a29613b5ae42445486eff3b35c27adb9c41b68": {
    functionName: "wfOverview_createServerFn_handler",
    importer: () => import("./wf.functions-CyhrH8V_.mjs")
  },
  "31a227d85330f9572db4b774e1502fc43b2d31c80ce0c4b7e182ac4454c451ad": {
    functionName: "adminDeleteUser_createServerFn_handler",
    importer: () => import("./accounts.functions-qhVdLijt.mjs")
  },
  "3bed5df2270a40545d8d6ad6a35bd41a99acc9beac8c4f862a6932c0b03677f0": {
    functionName: "gmfSendTest_createServerFn_handler",
    importer: () => import("./gmf.functions-BmLLghjg.mjs")
  },
  "3f1431998d0c90dd5cfc89d9f8f607520a42cdce80c80037b6058e0c93bf8ecc": {
    functionName: "testAiSuvietConnection_createServerFn_handler",
    importer: () => import("./assistant.functions-CGXlY8yQ.mjs")
  },
  "483ebddcdcb56717e3f0eb2a012a33da583984f8f0935a431f89a64df40bf814": {
    functionName: "finManualNotify_createServerFn_handler",
    importer: () => import("./gmf.functions-BmLLghjg.mjs")
  },
  "4ea97a7d6d57e103a328d8386c4bd690b747fd2406e2a2f421c2f1ae79b8cba3": {
    functionName: "zaloCareSave_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "51443d20085427e049939d0ded8ea9d9643b63a1da3ffff6ace0f32e534222e8": {
    functionName: "zaloSendTest_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "561e31ce3cfcbfd0111dcce569ccb72210bb2712f75f8cf5d5f6212889bc4f5a": {
    functionName: "frGroupDispatch_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-Ds_gGyUq.mjs")
  },
  "575f8e9cf35b1ba370cba87bc13367912675146ef02636b0293298e44cf164e9": {
    functionName: "fblPendingPages_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "5da6be177cacc9ebd2ee25941c5698310a2f140dc3b64e1120bff4a8e59ccdca": {
    functionName: "fblConnectPages_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "5ee6546e38af844b2fd8483e00a5714138c7eeb6aa5c00a5b52b2b6cf93cfd3f": {
    functionName: "extractAiPdf_createServerFn_handler",
    importer: () => import("./assistant.functions-CGXlY8yQ.mjs")
  },
  "5fb18e233e158f8adeabcf0ac2ac94e81daa50889ac496906724f09ef482320b": {
    functionName: "inboxAccessSave_createServerFn_handler",
    importer: () => import("./inbox.functions-CCSJQtYw.mjs")
  },
  "63f03e261920d3c5e5410e1fdadc53c73c3d6d46b6cd10f735738c7240b98231": {
    functionName: "frGroupStatus_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-Ds_gGyUq.mjs")
  },
  "64054c2f8a017f40740cd3693aa04575e5df7e6079232eb4626b1ab0acf0d820": {
    functionName: "chatControl_createServerFn_handler",
    importer: () => import("./chat.functions-B56Uv_kL.mjs")
  },
  "64e901a69723b9f9a7efa79f583a839ca9957e3f553efe224bfcf2d6fdf1b544": {
    functionName: "leaveGroupSendTest_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BQMdg21-.mjs")
  },
  "6585719a9c9b751c149303c3a714264737b14291b4be3eccd19b58db4e3cbb15": {
    functionName: "zaloSaveBaseUrl_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "66109454756f230b9fcf3a8b3f67f7423027305f5d529d751816015bac284620": {
    functionName: "getAiSuvietConfiguration_createServerFn_handler",
    importer: () => import("./assistant.functions-CGXlY8yQ.mjs")
  },
  "6c8389ee6c13ff0df59b18afb7ac0e77e9164a78fa9628f71810c20f908a2012": {
    functionName: "zaloMyLink_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "6d4fe17eb079327ce7e7e229905a07f31eb28f3d9e667b05266a475177064e07": {
    functionName: "gmfListGroups_createServerFn_handler",
    importer: () => import("./gmf.functions-BmLLghjg.mjs")
  },
  "79601276ec2df3b2e9dcad47b4ed7ebfefbefcaa859d127fa88508231536995a": {
    functionName: "adminResetPassword_createServerFn_handler",
    importer: () => import("./accounts.functions-qhVdLijt.mjs")
  },
  "79d07fba37371d06860825b6bcb8207c70dc6da6855dc7595d08badc5840e441": {
    functionName: "leaveGroupDispatch_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BQMdg21-.mjs")
  },
  "7ae3c5e5f7e3eec5aebbffec85923e4327a2485cbfc84b0aa6c8f97652d76eb4": {
    functionName: "designGroupStatus_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BRMGmx2S.mjs")
  },
  "7bd2ca0bbbf3348b612b6a32411fc4d40279e35506a40761f88f1eb0e4682bfe": {
    functionName: "leaveGroupStatus_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BQMdg21-.mjs")
  },
  "7d21e629d39e0be676db8b01fe888283db8946f80c51bfc050a68dd039293b2a": {
    functionName: "fblPageAction_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "841d1c5eda6051b4497c8abdd8e46ed901d19ad69d1e62277be85dd9f9098b65": {
    functionName: "editAiPersonalMemory_createServerFn_handler",
    importer: () => import("./assistant.functions-CGXlY8yQ.mjs")
  },
  "884590a2d512ae6560f76a5ec7ffb987d6aff38e8362f1e306ceddfeb15cc78f": {
    functionName: "wfEvents_createServerFn_handler",
    importer: () => import("./wf.functions-CyhrH8V_.mjs")
  },
  "8863ec5ccba96de5eb2fec8be552e85f5f98f73faa2bb909bb99e4bf172facf2": {
    functionName: "getDashboardContext_createServerFn_handler",
    importer: () => import("./dashboard.functions-OqRwsv5V.mjs")
  },
  "8ab9fbd99c194937ab7d267fa0a1b7eca0c96c4124f23e7eb82401e25c875fd5": {
    functionName: "gmfStatus_createServerFn_handler",
    importer: () => import("./gmf.functions-BmLLghjg.mjs")
  },
  "8be822aaa1dbdd9a386505b2bc972edecc9c728644c848a5fc555a275b1532e2": {
    functionName: "zaloDisconnect_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "8e9bf063149694a0dd7f68755b2305c6d6a6a674ba6aed9eaa8c14b26248717a": {
    functionName: "fblBackfill_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "8eb7f1b144331d3855ecc2551e3b84e8e5409f0f4543d586d083fd16b58b9342": {
    functionName: "chatThreadsFeed_createServerFn_handler",
    importer: () => import("./chat.functions-B56Uv_kL.mjs")
  },
  "8f63711dc87254661ec2efc96b6401ca9d2772b1ba4dc14671256bbda48aec8c": {
    functionName: "getDashboardData_createServerFn_handler",
    importer: () => import("./dashboard.functions-OqRwsv5V.mjs")
  },
  "929887aff1d5968d9366740b4512a36216d8e8e941124c10e2e5881da8ce6b89": {
    functionName: "inboxChange_createServerFn_handler",
    importer: () => import("./inbox.functions-CCSJQtYw.mjs")
  },
  "92c37464a4fff0c25f79887c18b9ffc3852c074e53c810666f38d8ef65c592cd": {
    functionName: "wfAddWebsite_createServerFn_handler",
    importer: () => import("./wf.functions-CyhrH8V_.mjs")
  },
  "92fe34a4eeb5154d8eacd2a74c4ea47cd2a42ba89a2246ab7f8a950f15813de5": {
    functionName: "inboxOverview_createServerFn_handler",
    importer: () => import("./inbox.functions-CCSJQtYw.mjs")
  },
  "93b3160c4359f888826ceb0911776aab491868237c51062421d151d27e93d57b": {
    functionName: "leaveGroupHistory_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BQMdg21-.mjs")
  },
  "93c164297f62ab1e48c3396f0993ad980f295fba749620026bcfa2d2143b9f0e": {
    functionName: "zaloSaveWebhookSecret_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "9b259f675f826e1640acaf3508384b658e0efd4a6042648b4502c05f30626c04": {
    functionName: "pushDispatch_createServerFn_handler",
    importer: () => import("./push.functions-BI2_0ClZ.mjs")
  },
  "9bffbba303463c9a97b3403b0ffa83cb188f7169e03ce0b47f495771351442c0": {
    functionName: "getAiSuvietAvailability_createServerFn_handler",
    importer: () => import("./assistant.functions-CGXlY8yQ.mjs")
  },
  "a0af737182f5ae592286b064ad942f1d5dfc8c2f512d324c9ace1bbe077706b7": {
    functionName: "inboxSend_createServerFn_handler",
    importer: () => import("./inbox.functions-CCSJQtYw.mjs")
  },
  "a9897e29da9dbd258b768d7c310b213960337aaf301f5ca3554cd154fee1addc": {
    functionName: "fblSaveForm_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "ab0531e7959561f631bb6f407f866610cf4f6378a64d8af8e21339c67ce1efda": {
    functionName: "chatThread_createServerFn_handler",
    importer: () => import("./chat.functions-B56Uv_kL.mjs")
  },
  "b03ef1627952dca145d4489c9db35c6b837043b81f8a2408ed710045dabf96b4": {
    functionName: "fblMaintainNow_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "b14b5d53da9d7f184ab7d3ccdb7b9c188fe63d57c5935c8aa58ff37982b4fe1e": {
    functionName: "designGroupSendTest_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BRMGmx2S.mjs")
  },
  "b98faef28b729ce34b107ebdd970e19fc39a05a86fbd8c90c1ef7220b065b7e7": {
    functionName: "leaveGroupRetry_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BQMdg21-.mjs")
  },
  "baf5a8f71ea1c10c552fe327489bd561ef08469c0ea51c28f617c1cd8f7a8c7d": {
    functionName: "saveAiSuvietKey_createServerFn_handler",
    importer: () => import("./assistant.functions-CGXlY8yQ.mjs")
  },
  "bd48348bad073d72b86e3e7a038dff9251ac3532fe050d7350d4e20b49a88395": {
    functionName: "zaloCareCounts_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "be840c6545bf12606064a9864263d17959e106da3249c6965920a558b53c22fb": {
    functionName: "chatAccess_createServerFn_handler",
    importer: () => import("./chat.functions-B56Uv_kL.mjs")
  },
  "c5e478e75ebc77a794a5a210f33462cc02bce3513ef659184a30faf6c3bf51eb": {
    functionName: "zaloSaveAppConfig_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "c82d2f943dc6173439c7274f8fc5c6d8899e3b9ace8e803a1fe3bb49ab885834": {
    functionName: "pushTest_createServerFn_handler",
    importer: () => import("./push.functions-BI2_0ClZ.mjs")
  },
  "c987dfb3afb4f42f772a5b769c611b53a78dba13a99bf55cb8762fb6f81e05a6": {
    functionName: "frGroupRetry_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-Ds_gGyUq.mjs")
  },
  "ca55cf1eaa78cf9ebaf6a35993f5c91db16890425e33bec763eff69caa7f7f0e": {
    functionName: "askAiSuviet_createServerFn_handler",
    importer: () => import("./assistant.functions-CGXlY8yQ.mjs")
  },
  "d494b04609645b6d30de3317d5fe8e03532a73573fd6b2b13fb43f7a2b517bf1": {
    functionName: "forgetAiPersonalMemory_createServerFn_handler",
    importer: () => import("./assistant.functions-CGXlY8yQ.mjs")
  },
  "d4be283b27aea2cec8578b29c2869ce211d10eafcded78001badacb5c09f0eb6": {
    functionName: "zaloRetryFailed_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "d8e0ca35874fbea344a87570d2fb1b8114c5c807504ce9851193340c06b87903": {
    functionName: "frGroupListGroups_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-Ds_gGyUq.mjs")
  },
  "e242f45ad4f754d7b255df768ebf8b0489c3a237f31a49327ded2df8270c48e7": {
    functionName: "designGroupRetryEvent_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-BRMGmx2S.mjs")
  },
  "e243f0caa08b25912376e4e7fd591a6f911bff7df0507d2d4f1dfad1034c9e3d": {
    functionName: "finRemindManual_createServerFn_handler",
    importer: () => import("./gmf.functions-BmLLghjg.mjs")
  },
  "e308716a992afcbcddc20c5061849c1a64edfd606eba580c431d095b1647663c": {
    functionName: "fblWebhookDiagnostic_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "e4a87921327b8165a8b41b55ffbc7e8329ccee77221917746c4703999d3de5d3": {
    functionName: "zaloDispatch_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "e4e0298a8fbaca62f929b46543eff5b6e0b8baaa44217a31c95ae11288fc8b14": {
    functionName: "fblRetry_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "e673070006620209c01601f62906ad4d237be476d9c9c32a036e48484bb4ee1a": {
    functionName: "wfRetry_createServerFn_handler",
    importer: () => import("./wf.functions-CyhrH8V_.mjs")
  },
  "e68df4c2e93e0538e8766aef46f554039e59cb2f62b520bb8cebe6e556c91ace": {
    functionName: "chatRotateKey_createServerFn_handler",
    importer: () => import("./chat.functions-B56Uv_kL.mjs")
  },
  "e7d55f66a5107ba7e1d3b8d32abe7f547587f7286cf17f139134a3bb33285301": {
    functionName: "fblOverview_createServerFn_handler",
    importer: () => import("./fb.functions-H-mDrhKm.mjs")
  },
  "e999d3a4df0a97eaced3cbf44c32291c306ba2c26fae06b86b8c8c0569212c5e": {
    functionName: "zaloConnectUrl_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "eca19a8db00e51b2fd646cb07888c38407844df44252379f4ff08377b69439e8": {
    functionName: "zaloCheck_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "ee75ed25866f6199664756a7b2dda7ca8277034b6ea6741604c2f818badf379e": {
    functionName: "chatOverview_createServerFn_handler",
    importer: () => import("./chat.functions-B56Uv_kL.mjs")
  },
  "eff8e81716b2b5f6815cad9a1ddeb2d590e855c41f31fb1a7b5ef7c72d3a71c6": {
    functionName: "wfWebsiteAction_createServerFn_handler",
    importer: () => import("./wf.functions-CyhrH8V_.mjs")
  },
  "f0560cba6e78124fbe70281cdb6658ca03956ca1086f024dd702eaae908c3391": {
    functionName: "reviewDashboard_createServerFn_handler",
    importer: () => import("./dashboard.functions-OqRwsv5V.mjs")
  },
  "f2e7036af4d84b075f6716556e8f2c61e0eabfb815addffd6413b27aca0facc9": {
    functionName: "chatThreads_createServerFn_handler",
    importer: () => import("./chat.functions-B56Uv_kL.mjs")
  },
  "f516f56a666c34695e0bc440b7cd8c573e0c087f5526d574ec10e8a85be015e6": {
    functionName: "inboxRead_createServerFn_handler",
    importer: () => import("./inbox.functions-CCSJQtYw.mjs")
  },
  "f57fd0b7f4e4d56700ce15b25a00afe72fcbd082ab9f468767e76d01767832d4": {
    functionName: "frGroupSave_createServerFn_handler",
    importer: () => import("./zaloGroup.functions-Ds_gGyUq.mjs")
  },
  "f67fe2bec1fc0f4033cb868922c196a52dd6269fa4253b8bcff160c4c8396340": {
    functionName: "zaloReminderHealth_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "f9613bbc5984a8a3673102e07570014ad20a076e575a5e582c7effafe36b5b70": {
    functionName: "zaloAdminStatus_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "fc252f009930dd2f052adbdf13b908fe3fa763f25fcb5a32fc157726149716c9": {
    functionName: "zaloCreateLinkCode_createServerFn_handler",
    importer: () => import("./zalo.functions-BRBY52Bg.mjs")
  },
  "fdc833ecb4cfc79641bf8b3a39bd04225a35472e9c78dc9ab0557a7c7e4ffe43": {
    functionName: "gmfSave_createServerFn_handler",
    importer: () => import("./gmf.functions-BmLLghjg.mjs")
  }
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = serverFnInfo.module ??= await serverFnInfo.importer();
  if (!fnModule) {
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    throw new Error("Server function module export not resolved for serverFn ID: " + id);
  }
  return action;
}
var TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
var TSS_SERVER_FUNCTION = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION");
var TSS_SERVER_FUNCTION_FACTORY = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION_FACTORY");
var X_TSS_SERIALIZED = "x-tss-serialized";
var X_TSS_RAW_RESPONSE = "x-tss-raw";
var TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
var FRAME_TYPE_JSON = 0;
var FRAME_TYPE_CHUNK = 1;
var FRAME_TYPE_END = 2;
var FRAME_TYPE_ERROR = 3;
var FRAME_HEADER_SIZE = 9;
var MAX_FRAME_PAYLOAD_SIZE = 16 * 1024 * 1024;
var MAX_FRAMED_STREAMS = 1024;
var TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=1`;
var GLOBAL_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:start-storage-context");
var globalObj = globalThis;
if (!globalObj[GLOBAL_STORAGE_KEY]) globalObj[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
var startStorage = globalObj[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn) {
  return startStorage.run(context, fn);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) throw new Error(`No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return context;
}
var getStartOptions = () => getStartContext().startOptions;
function getSerovalPlugins(routerPlugins) {
  return [...getStartOptions()?.serializationAdapters?.map(makeSerovalPlugin) ?? [], ...routerPlugins];
}
var textEncoder$1 = new TextEncoder();
var EMPTY_PAYLOAD = new Uint8Array(0);
var MAX_ERROR_MESSAGE_CODE_UNITS = 4096;
function encodeFrame(type, streamId, payload) {
  if (payload.byteLength > MAX_FRAME_PAYLOAD_SIZE) throw new RangeError(`Frame payload exceeds ${MAX_FRAME_PAYLOAD_SIZE} bytes`);
  const frame = new Uint8Array(FRAME_HEADER_SIZE + payload.length);
  frame[0] = type;
  frame[1] = streamId >>> 24 & 255;
  frame[2] = streamId >>> 16 & 255;
  frame[3] = streamId >>> 8 & 255;
  frame[4] = streamId & 255;
  frame[5] = payload.length >>> 24 & 255;
  frame[6] = payload.length >>> 16 & 255;
  frame[7] = payload.length >>> 8 & 255;
  frame[8] = payload.length & 255;
  frame.set(payload, FRAME_HEADER_SIZE);
  return frame;
}
function encodeErrorPayload(error) {
  const originalMessage = error instanceof Error ? error.message : String(error ?? "Unknown error");
  const message = originalMessage.length > MAX_ERROR_MESSAGE_CODE_UNITS ? `${originalMessage.slice(0, MAX_ERROR_MESSAGE_CODE_UNITS)}…` : originalMessage;
  return textEncoder$1.encode(message);
}
function createMultiplexedStream(recordStream, options = {}) {
  let controller;
  let stopped = false;
  let activePumps = 0;
  let wakeDemand;
  let admission;
  const readers = /* @__PURE__ */ new Set();
  const pendingRawStreams = /* @__PURE__ */ new Set();
  const abortOutput = () => errorOutput(options.signal?.reason);
  const wakeAdmission = () => {
    const wake = wakeDemand;
    wakeDemand = void 0;
    wake?.();
  };
  const cancelReader = (reader, reason) => {
    reader.cancel(reason).catch(() => {
    });
  };
  const cancelStream = (stream, reason) => {
    stream.cancel(reason).catch(() => {
    });
  };
  const stop = (reason) => {
    if (stopped) return false;
    stopped = [reason];
    options.signal?.removeEventListener("abort", abortOutput);
    wakeAdmission();
    for (const reader of readers) cancelReader(reader, reason);
    for (const stream of pendingRawStreams) cancelStream(stream, reason);
    pendingRawStreams.clear();
    return true;
  };
  const errorOutput = (error) => {
    if (!stop(error)) return;
    try {
      controller.error(error);
    } catch {
    }
  };
  const waitForDemand = async () => {
    while (!stopped && (controller.desiredSize ?? 0) <= 0) await new Promise((resolve) => {
      wakeDemand = resolve;
    });
    return !stopped;
  };
  const admitFrame = (type, streamId, payload) => {
    if (stopped) return false;
    if (!admission && (controller.desiredSize ?? 0) > 0) {
      controller.enqueue(encodeFrame(type, streamId, payload));
      return true;
    }
    const runAdmission = async () => {
      if (!await waitForDemand()) return false;
      controller.enqueue(encodeFrame(type, streamId, payload));
      return true;
    };
    const result = admission ? admission.then(runAdmission) : runAdmission();
    const clearAdmission = () => {
      if (admission === tail) admission = void 0;
    };
    const tail = result.then(clearAdmission, clearAdmission);
    admission = tail;
    return result;
  };
  const maybeClose = () => {
    if (activePumps !== 0 || !stop()) return;
    try {
      controller.close();
    } catch {
    }
  };
  const startPump = (pump) => {
    activePumps++;
    pump().then(() => {
      activePumps--;
      maybeClose();
    }, (error) => {
      activePumps--;
      errorOutput(error);
    });
  };
  async function pumpRawStream(streamId, stream) {
    const reader = stream.getReader();
    readers.add(reader);
    try {
      while (!stopped) {
        const { done, value } = await reader.read();
        if (stopped) return;
        if (done) {
          const frameAdmission = admitFrame(FRAME_TYPE_END, streamId, EMPTY_PAYLOAD);
          if (frameAdmission !== true) await frameAdmission;
          return;
        }
        if (!(value instanceof Uint8Array)) throw new TypeError("RawStream chunks must be Uint8Array");
        let offset = 0;
        do {
          const frameAdmission = admitFrame(FRAME_TYPE_CHUNK, streamId, value.byteLength <= MAX_FRAME_PAYLOAD_SIZE ? value : value.subarray(offset, offset + MAX_FRAME_PAYLOAD_SIZE));
          if (frameAdmission !== true && (frameAdmission === false || !await frameAdmission)) return;
          offset += MAX_FRAME_PAYLOAD_SIZE;
        } while (offset < value.byteLength);
      }
    } catch (error) {
      if (!stopped) {
        const frameAdmission = admitFrame(FRAME_TYPE_ERROR, streamId, encodeErrorPayload(error));
        if (frameAdmission !== true) await frameAdmission;
      }
    } finally {
      readers.delete(reader);
      reader.releaseLock();
    }
  }
  async function pumpRecords() {
    const reader = recordStream.getReader();
    readers.add(reader);
    try {
      while (!stopped) {
        const { done, value } = await reader.read();
        if (stopped) {
          if (!done) for (const registration of value.rawStreams) cancelStream(registration.stream, stopped[0]);
          return;
        }
        if (done) return;
        for (const registration of value.rawStreams) pendingRawStreams.add(registration.stream);
        const frameAdmission = admitFrame(FRAME_TYPE_JSON, 0, value.json);
        if (frameAdmission !== true && (frameAdmission === false || !await frameAdmission)) return;
        for (const registration of value.rawStreams) {
          pendingRawStreams.delete(registration.stream);
          startPump(pumpRawStream.bind(void 0, registration.id, registration.stream));
        }
      }
    } catch (error) {
      if (!stopped) errorOutput(error);
    } finally {
      readers.delete(reader);
      reader.releaseLock();
    }
  }
  return new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      if (options.signal?.aborted) {
        cancelStream(recordStream, options.signal.reason);
        errorOutput(options.signal.reason);
        return;
      }
      options.signal?.addEventListener("abort", abortOutput, { once: true });
      startPump(pumpRecords);
    },
    pull() {
      wakeAdmission();
    },
    cancel(reason) {
      if (stop(reason)) options.onCancel?.(reason);
    }
  });
}
function isSafeKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function safeObjectMerge(target, source) {
  const result = /* @__PURE__ */ Object.create(null);
  if (target) {
    for (const key of Object.keys(target)) if (isSafeKey(key)) result[key] = target[key];
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) if (isSafeKey(key)) result[key] = source[key];
  }
  return result;
}
function createNullProtoObject(source) {
  if (!source) return /* @__PURE__ */ Object.create(null);
  const obj = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(source)) if (isSafeKey(key)) obj[key] = source[key];
  return obj;
}
var getStartContextServerOnly = getStartContext;
var createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") resolvedOptions.method = "GET";
  const setValidator = (validator) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      validator,
      inputValidator: validator
    });
  };
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.forEach((item) => {
        if (TSS_SERVER_FUNCTION_FACTORY in item) {
          if (item.options.middleware) newMiddleware.push(...item.options.middleware);
        } else newMiddleware.push(item);
      });
      const res2 = createServerFn(void 0, {
        ...resolvedOptions,
        middleware: newMiddleware
      });
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    validator: setValidator,
    inputValidator: setValidator,
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = {
        ...resolvedOptions,
        extractedFn,
        serverFn
      };
      const resolvedMiddleware = [...newOptions.middleware || [], serverFnBaseToMiddleware(newOptions)];
      extractedFn.method = resolvedOptions.method;
      return Object.assign(async (opts) => {
        const result = await executeMiddleware$1(resolvedMiddleware, "client", {
          ...extractedFn,
          ...newOptions,
          data: opts?.data,
          headers: opts?.headers,
          signal: opts?.signal,
          fetch: opts?.fetch,
          context: createNullProtoObject()
        });
        const redirect = parseRedirect(result.error);
        if (redirect) throw redirect;
        if (result.error) throw result.error;
        return result.result;
      }, {
        ...extractedFn,
        method: resolvedOptions.method,
        __executeServer: async (opts) => {
          const startContext = getStartContextServerOnly();
          const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
          return await executeMiddleware$1(resolvedMiddleware, "server", {
            ...extractedFn,
            data: opts.data,
            method: opts.method ?? resolvedOptions.method,
            serverFnMeta: extractedFn.serverFnMeta,
            context: safeObjectMerge(opts.context, serverContextAfterGlobalMiddlewares),
            request: startContext.request
          }).then((d) => ({
            result: d.result,
            error: d.error,
            context: d.sendContext
          }));
        }
      });
    }
  };
  const fun = (options2) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      ...options2
    });
  };
  return Object.assign(fun, res);
};
async function executeMiddleware$1(middlewares, env, opts) {
  let flattenedMiddlewares = flattenMiddlewares([...getStartOptions()?.functionMiddleware || [], ...middlewares]);
  if (env === "server") {
    const startContext = getStartContextServerOnly({ throwIfNotFound: false });
    if (startContext?.executedRequestMiddlewares) flattenedMiddlewares = flattenedMiddlewares.filter((m) => !startContext.executedRequestMiddlewares.has(m));
  }
  const callNextMiddleware = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) return ctx;
    try {
      let validator = "validator" in nextMiddleware.options ? nextMiddleware.options.validator : void 0;
      if (!validator && "inputValidator" in nextMiddleware.options) validator = nextMiddleware.options.inputValidator;
      if (validator && env === "server") ctx.data = await execValidator(validator, ctx.data);
      let middlewareFn = void 0;
      if (env === "client") {
        if ("client" in nextMiddleware.options) middlewareFn = nextMiddleware.options.client;
      } else if ("server" in nextMiddleware.options) middlewareFn = nextMiddleware.options.server;
      if (middlewareFn) {
        const userNext = async (userCtx = {}) => {
          const result2 = await callNextMiddleware({
            ...ctx,
            ...userCtx,
            context: safeObjectMerge(ctx.context, userCtx.context),
            sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
            headers: mergeHeaders(ctx.headers, userCtx.headers),
            _callSiteFetch: ctx._callSiteFetch,
            fetch: ctx._callSiteFetch ?? userCtx.fetch ?? ctx.fetch,
            result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
            error: userCtx.error ?? ctx.error
          });
          if (result2.error) throw result2.error;
          return result2;
        };
        const result = await middlewareFn({
          ...ctx,
          next: userNext
        });
        if (isRedirect(result)) return {
          ...ctx,
          error: result
        };
        if (result instanceof Response) return {
          ...ctx,
          result
        };
        if (!result) throw new Error("User middleware returned undefined. You must call next() or return a result in your middlewares.");
        return result;
      }
      return callNextMiddleware(ctx);
    } catch (error) {
      return {
        ...ctx,
        error
      };
    }
  };
  return callNextMiddleware({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || createNullProtoObject(),
    _callSiteFetch: opts.fetch
  });
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware, depth) => {
    if (depth > maxDepth) throw new Error(`Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`);
    middleware.forEach((m) => {
      if (m.options.middleware) recurse(m.options.middleware, depth + 1);
      if (!seen.has(m)) {
        seen.add(m);
        flattened.push(m);
      }
    });
  };
  recurse(middlewares, 0);
  return flattened;
}
async function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = await validator["~standard"].validate(input);
    if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) return validator.parse(input);
  if (typeof validator === "function") return validator(input);
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    "~types": void 0,
    options: {
      inputValidator: options.validator ?? options.inputValidator,
      client: async ({ next, sendContext, fetch: fetch2, ...ctx }) => {
        const payload = {
          ...ctx,
          context: sendContext,
          fetch: fetch2
        };
        return next(await options.extractedFn?.(payload));
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
var createMiddleware = (options, __opts) => {
  const resolvedOptions = {
    type: "request",
    ...__opts || options
  };
  const setValidator = (validator) => {
    return createMiddleware({}, Object.assign(resolvedOptions, {
      validator,
      inputValidator: validator
    }));
  };
  return {
    options: resolvedOptions,
    middleware: (middleware) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { middleware }));
    },
    validator: setValidator,
    inputValidator: setValidator,
    client: (client) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { client }));
    },
    server: (server2) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { server: server2 }));
    }
  };
};
var innerCreateCsrfMiddleware = (opts = {}) => {
  const middleware = createMiddleware().server(async (ctx) => {
    const csrfCtx = ctx;
    if (opts.filter && !await opts.filter(csrfCtx)) return ctx.next();
    if (await isCsrfRequestAllowed(opts, csrfCtx)) return ctx.next();
    return getFailureResponse(opts, csrfCtx);
  });
  return middleware;
};
var createCsrfMiddleware = innerCreateCsrfMiddleware;
async function isCsrfRequestAllowed(opts, ctx) {
  const result = await getCsrfRequestValidationResult(opts, ctx);
  return result === true || result === void 0 && opts.allowRequestsWithoutOriginCheck === true;
}
async function getCsrfRequestValidationResult(opts, ctx) {
  const fetchSite = ctx.request.headers.get("Sec-Fetch-Site");
  if (fetchSite !== null) return matchValue(opts.secFetchSite ?? "same-origin", fetchSite, ctx);
  const origin = ctx.request.headers.get("Origin");
  if (origin !== null) {
    if (opts.origin) return matchValue(opts.origin, origin, ctx);
    return origin === new URL(ctx.request.url).origin;
  }
  const referer = ctx.request.headers.get("Referer");
  if (referer === null || opts.referer === false) return;
  if (typeof opts.referer === "function") return opts.referer(referer, ctx);
  if (opts.origin) {
    const refererOrigin = getOriginFromUrl(referer);
    return refererOrigin !== void 0 && matchValue(opts.origin, refererOrigin, ctx);
  }
  return isRefererSameOrigin(referer, new URL(ctx.request.url).origin);
}
async function matchValue(matcher, value, ctx) {
  if (typeof matcher === "function") return matcher(value, ctx);
  if (Array.isArray(matcher)) return matcher.includes(value);
  return value === matcher;
}
function getOriginFromUrl(url) {
  try {
    return new URL(url).origin;
  } catch {
    return;
  }
}
function isRefererSameOrigin(referer, requestOrigin) {
  if (referer === requestOrigin) return true;
  if (!referer.startsWith(requestOrigin)) return false;
  if (referer.length === requestOrigin.length) return true;
  const code = referer.charCodeAt(requestOrigin.length);
  return code === 47 || code === 63 || code === 35;
}
async function getFailureResponse(opts, ctx) {
  if (typeof opts.failureResponse === "function") return opts.failureResponse(ctx);
  return opts.failureResponse?.clone() ?? new Response("Forbidden", {
    status: 403
  });
}
var serovalPlugins = void 0;
var FORM_DATA_CONTENT_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
var MAX_PAYLOAD_SIZE = 1e6;
var MAX_PENDING_SERIALIZATION_RECORDS = 1024;
var MAX_PENDING_SERIALIZATION_BYTES = 32 * 1024 * 1024;
var textEncoder = new TextEncoder();
function encodeSerializationRecord(value) {
  return textEncoder.encode(JSON.stringify(value));
}
function exceedsPendingSerializationLimit(record, recordCount, pendingBytes) {
  return recordCount >= MAX_PENDING_SERIALIZATION_RECORDS || pendingBytes + record.byteLength > MAX_PENDING_SERIALIZATION_BYTES;
}
function runSerializationCleanup(dispose) {
  try {
    dispose();
  } catch {
  }
}
function cancelRawStream(stream, reason) {
  stream.cancel(reason).catch(() => {
  });
}
var handleServerAction = async ({ request, context, serverFnId }) => {
  const methodUpper = request.method.toUpperCase();
  const url = new URL(request.url);
  const action = await getServerFnById(serverFnId);
  if (action.method && methodUpper !== action.method) return new Response(`expected ${action.method} method. Got ${methodUpper}`, {
    status: 405,
    headers: { Allow: action.method }
  });
  const isServerFn = request.headers.get("x-tsr-serverFn") === "true";
  serovalPlugins ??= getSerovalPlugins(defaultSerovalDeserializerPlugins);
  const contentType = request.headers.get("Content-Type");
  try {
    let res;
    if (FORM_DATA_CONTENT_TYPES.some((type) => contentType && contentType.includes(type))) {
      if (methodUpper === "GET") {
        if (false) ;
        invariant();
      }
      const formData = await request.formData();
      const serializedContext = formData.get(TSS_FORMDATA_CONTEXT);
      formData.delete(TSS_FORMDATA_CONTEXT);
      const params = {
        context,
        data: formData,
        method: methodUpper
      };
      if (typeof serializedContext === "string") try {
        const deserializedContext = fromJSON(JSON.parse(serializedContext), { plugins: serovalPlugins });
        if (typeof deserializedContext === "object" && deserializedContext) params.context = safeObjectMerge(deserializedContext, context);
      } catch (e) {
        if (false) ;
      }
      res = await action(params);
    } else if (methodUpper === "GET") {
      const payloadParam = url.searchParams.get("payload");
      if (payloadParam && payloadParam.length > MAX_PAYLOAD_SIZE) throw new Error("Payload too large");
      const payload = payloadParam ? fromJSON(JSON.parse(payloadParam), { plugins: serovalPlugins }) : void 0;
      res = await action({
        data: payload?.data,
        context: safeObjectMerge(payload?.context, context),
        method: methodUpper
      });
    } else {
      const payload = contentType?.includes("application/json") ? fromJSON(await request.json(), { plugins: serovalPlugins }) : void 0;
      res = await action({
        data: payload?.data,
        context: safeObjectMerge(payload?.context, context),
        method: methodUpper
      });
    }
    const unwrapped = res.error !== void 0 ? res.error : res.result;
    if (isNotFound(res)) res = isNotFoundResponse(res);
    if (!isServerFn && (unwrapped instanceof Response || unwrapped === null || typeof unwrapped !== "object")) return unwrapped;
    if (unwrapped instanceof Response) {
      if (isRedirect(unwrapped)) return unwrapped;
      unwrapped.headers.set(X_TSS_RAW_RESPONSE, "true");
      return unwrapped;
    }
    return serializeResult(res, request.signal, serovalPlugins);
  } catch (error) {
    if (error instanceof Response) return error;
    if (isNotFound(error)) return isNotFoundResponse(error);
    console.error("Server Fn Error!", error);
    const serializedError = JSON.stringify(await toCrossJSONAsync(error, {
      refs: /* @__PURE__ */ new Map(),
      plugins: serovalPlugins
    }));
    const response = getResponse();
    const headers = {
      "Content-Type": "application/json",
      [X_TSS_SERIALIZED]: "true"
    };
    try {
      return new Response(serializedError, {
        status: response.status ?? 500,
        statusText: response.statusText,
        headers
      });
    } catch {
      return new Response(serializedError, {
        status: 500,
        statusText: "",
        headers
      });
    }
  }
};
function serializeResult(res, signal, plugins) {
  const alsResponse = getResponse();
  const initialRecords = [];
  let initialBytes = 0;
  const pendingRawStreams = [];
  let done = false;
  let initialParsed = false;
  let serializationFailure;
  let disposeSerialization;
  let onParse = (value, initial) => {
    if (serializationFailure) return;
    initialParsed ||= initial;
    const record = encodeSerializationRecord(value);
    if (exceedsPendingSerializationLimit(record, initialRecords.length, initialBytes)) {
      serializationFailure = [/* @__PURE__ */ new Error("Server function serialization exceeded its pending output limit")];
      return;
    }
    initialRecords.push(record);
    initialBytes += record.byteLength;
  };
  let onDone = () => {
    if (initialParsed) done = true;
  };
  let onError = (error) => {
    serializationFailure ??= [error];
  };
  const rawStreamPlugin = createRawStreamRPCPlugin((id, stream) => {
    if (serializationFailure) {
      cancelRawStream(stream, serializationFailure[0]);
      return;
    }
    if (id > MAX_FRAMED_STREAMS) {
      const error = /* @__PURE__ */ new Error(`Too many raw streams in framed response (max ${MAX_FRAMED_STREAMS})`);
      cancelRawStream(stream, error);
      onError(error);
      return;
    }
    pendingRawStreams.push({
      id,
      stream
    });
  });
  const dispose = toCrossJSONStream(res, {
    refs: /* @__PURE__ */ new Map(),
    plugins: [rawStreamPlugin, ...plugins],
    onParse(value, initial) {
      onParse(value, initial);
    },
    onDone() {
      onDone();
    },
    onError: (error) => {
      onError(error);
    }
  });
  if (serializationFailure) {
    runSerializationCleanup(dispose);
    for (const registration of pendingRawStreams) cancelRawStream(registration.stream, serializationFailure[0]);
    throw serializationFailure[0];
  }
  if (!done) disposeSerialization = dispose;
  if (done && pendingRawStreams.length === 0 && initialRecords.length === 1) return new Response(initialRecords[0], {
    status: alsResponse.status,
    statusText: alsResponse.statusText,
    headers: {
      "Content-Type": "application/json",
      [X_TSS_SERIALIZED]: "true"
    }
  });
  if (done && initialRecords.length === 1) {
    const json = initialRecords[0];
    if (json.byteLength > MAX_FRAME_PAYLOAD_SIZE) {
      const error = /* @__PURE__ */ new Error("Server function serialization exceeded its pending output limit");
      for (const registration of pendingRawStreams) cancelRawStream(registration.stream, error);
      throw error;
    }
    const rawStreams = pendingRawStreams.splice(0);
    initialRecords.length = 0;
    return createFramedResponse(new ReadableStream({
      start(controller) {
        controller.enqueue({
          json,
          rawStreams
        });
        controller.close();
      },
      cancel(reason) {
        for (const registration of rawStreams) cancelRawStream(registration.stream, reason);
      }
    }), { signal });
  }
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const recordAbortController = new AbortController();
  let pendingBytes = 0;
  const pendingRecords = /* @__PURE__ */ new Set();
  const abortRecordStream = (error) => {
    if (serializationFailure) return;
    serializationFailure = [error];
    const disposeCurrentSerialization = disposeSerialization;
    disposeSerialization = void 0;
    for (const registration of pendingRawStreams.splice(0)) cancelRawStream(registration.stream, error);
    for (const record of pendingRecords) for (const registration of record.rawStreams) cancelRawStream(registration.stream, error);
    pendingRecords.clear();
    recordAbortController.abort(error);
    writer.abort(error).catch(() => {
    });
    if (disposeCurrentSerialization) runSerializationCleanup(disposeCurrentSerialization);
  };
  const writeRecord = (json, rawStreams) => {
    if (serializationFailure) {
      for (const registration of rawStreams) cancelRawStream(registration.stream, serializationFailure[0]);
      return false;
    }
    if (json.byteLength > MAX_FRAME_PAYLOAD_SIZE || exceedsPendingSerializationLimit(json, pendingRecords.size, pendingBytes)) {
      const error = /* @__PURE__ */ new Error("Server function serialization exceeded its pending output limit");
      for (const registration of rawStreams) cancelRawStream(registration.stream, error);
      onError(error);
      return false;
    }
    pendingBytes += json.byteLength;
    const record = {
      json,
      rawStreams
    };
    pendingRecords.add(record);
    writer.write(record).then(() => {
      pendingRecords.delete(record);
      pendingBytes -= json.byteLength;
    }, (error) => {
      const stillOwned = pendingRecords.delete(record);
      pendingBytes -= json.byteLength;
      if (stillOwned) for (const registration of rawStreams) cancelRawStream(registration.stream, error);
    });
    return true;
  };
  onParse = (value) => {
    if (serializationFailure) return;
    writeRecord(encodeSerializationRecord(value), pendingRawStreams.splice(0));
  };
  onDone = () => {
    if (serializationFailure) return;
    disposeSerialization = void 0;
    writer.close().catch(() => {
    });
  };
  onError = (error) => {
    abortRecordStream(error);
  };
  const initialRawStreams = pendingRawStreams.splice(0);
  for (let index = 0; index < initialRecords.length; index++) {
    const isLast = index === initialRecords.length - 1;
    if (!writeRecord(initialRecords[index], isLast ? initialRawStreams : [])) {
      if (!isLast) for (const registration of initialRawStreams) cancelRawStream(registration.stream, serializationFailure[0]);
      initialRecords.length = 0;
      throw serializationFailure[0];
    }
  }
  initialRecords.length = 0;
  if (done) onDone();
  writer.closed.catch((error) => {
    abortRecordStream(error);
  });
  return createFramedResponse(readable, {
    signal: AbortSignal.any([recordAbortController.signal, signal]),
    onCancel: abortRecordStream
  });
  function createFramedResponse(records, options) {
    const multiplexedStream = createMultiplexedStream(records, options);
    try {
      return new Response(multiplexedStream, {
        status: alsResponse.status,
        statusText: alsResponse.statusText,
        headers: {
          "Content-Type": TSS_CONTENT_TYPE_FRAMED_VERSIONED,
          [X_TSS_SERIALIZED]: "true"
        }
      });
    } catch (error) {
      cancelRawStream(multiplexedStream, error);
      throw error;
    }
  }
}
function isNotFoundResponse(error) {
  const { headers, ...rest } = error;
  const response = new Response(JSON.stringify(rest), {
    status: 404,
    headers
  });
  response.headers.set("Content-Type", "application/json");
  return response;
}
var LINK_PARAM_TOKEN_RE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
var PRELOAD_AS_VALUES = /* @__PURE__ */ new Set([
  "fetch",
  "font",
  "image",
  "script",
  "style",
  "track"
]);
function buildLinkParam(name, value) {
  if (value === void 0) return name;
  if (LINK_PARAM_TOKEN_RE.test(value)) return `${name}=${value}`;
  return `${name}=${JSON.stringify(value)}`;
}
function serializeEarlyHint(hint) {
  const parts = [`<${hint.href}>`, buildLinkParam("rel", hint.rel)];
  if (hint.as) parts.push(buildLinkParam("as", hint.as));
  if (hint.crossOrigin !== void 0) parts.push(buildLinkParam("crossorigin", hint.crossOrigin || void 0));
  if (hint.type) parts.push(buildLinkParam("type", hint.type));
  if (hint.integrity) parts.push(buildLinkParam("integrity", hint.integrity));
  if (hint.referrerPolicy) parts.push(buildLinkParam("referrerpolicy", hint.referrerPolicy));
  if (hint.fetchPriority) parts.push(buildLinkParam("fetchpriority", hint.fetchPriority));
  return parts.join("; ");
}
function getStringAttr(attrs, name, fallbackName) {
  const value = attrs?.[name] ?? (fallbackName ? attrs?.[fallbackName] : void 0);
  return typeof value === "string" ? value : void 0;
}
function getPreloadAs(attrs) {
  const as = getStringAttr(attrs, "as");
  return as && PRELOAD_AS_VALUES.has(as) ? as : void 0;
}
function addEarlyHintFetchAttrs(hint, attrs) {
  const crossOrigin = getStringAttr(attrs, "crossOrigin", "crossorigin");
  const type = getStringAttr(attrs, "type");
  const integrity = getStringAttr(attrs, "integrity");
  const referrerPolicy = getStringAttr(attrs, "referrerPolicy", "referrerpolicy");
  const fetchPriority = getStringAttr(attrs, "fetchPriority", "fetchpriority");
  if (crossOrigin !== void 0) hint.crossOrigin = crossOrigin;
  if (type) hint.type = type;
  if (integrity) hint.integrity = integrity;
  if (referrerPolicy) hint.referrerPolicy = referrerPolicy;
  if (fetchPriority) hint.fetchPriority = fetchPriority;
}
function linkAttrsToEarlyHint(attrs) {
  const href = getStringAttr(attrs, "href");
  const rel = getStringAttr(attrs, "rel");
  if (!href || !rel) return void 0;
  const relTokens = rel.split(/\s+/);
  let hintRel;
  let hintAs;
  if (relTokens.includes("modulepreload")) {
    hintRel = "modulepreload";
    hintAs = "script";
  } else if (relTokens.includes("stylesheet")) {
    hintRel = "preload";
    hintAs = "style";
  } else if (relTokens.includes("preload")) {
    hintAs = getPreloadAs(attrs);
    if (!hintAs) return void 0;
    hintRel = "preload";
  } else if (relTokens.includes("preconnect")) {
    hintRel = "preconnect";
    hintAs = void 0;
  } else if (relTokens.includes("dns-prefetch")) {
    hintRel = "dns-prefetch";
    hintAs = void 0;
  }
  if (!hintRel) return void 0;
  const hint = {
    href,
    rel: hintRel
  };
  if (hintAs) hint.as = hintAs;
  addEarlyHintFetchAttrs(hint, attrs);
  return hint;
}
function collectStaticHintsFromManifest(manifest2, matchedRoutes) {
  const hints = [];
  for (const route of matchedRoutes) {
    const routeManifest = manifest2.routes[route.id];
    if (!routeManifest) continue;
    for (const link of routeManifest.preloads ?? []) {
      const attrs = getScriptPreloadAttrs(manifest2, link);
      const hint = {
        href: attrs.href,
        rel: attrs.rel,
        as: "script"
      };
      if (attrs.crossOrigin !== void 0) hint.crossOrigin = attrs.crossOrigin;
      hints.push(hint);
    }
    for (const link of routeManifest.css ?? []) {
      const stylesheetHref = getStylesheetHref(link);
      if (manifest2.inlineCss?.styles[stylesheetHref] !== void 0) continue;
      const resolvedLink = resolveManifestCssLink(link);
      const hint = {
        href: stylesheetHref,
        rel: "preload",
        as: "style"
      };
      if (resolvedLink.crossOrigin !== void 0) hint.crossOrigin = resolvedLink.crossOrigin;
      hints.push(hint);
    }
  }
  return hints;
}
function collectDynamicHintsFromMatches(matches) {
  const hints = [];
  for (const match of matches) {
    const links = match.links;
    if (!Array.isArray(links)) continue;
    for (const link of links) {
      const hint = linkAttrsToEarlyHint(link);
      if (hint) hints.push(hint);
    }
  }
  return hints;
}
function createEarlyHintsEvent(opts) {
  const nextHints = [];
  const nextLinks = [];
  for (const hint of opts.hints) {
    const link = serializeEarlyHint(hint);
    if (opts.sentLinks.has(link)) continue;
    opts.sentLinks.add(link);
    opts.sentHints.push(hint);
    nextHints.push(hint);
    nextLinks.push(link);
  }
  if (!nextHints.length && opts.phase !== "dynamic") return void 0;
  return {
    phase: opts.phase,
    hints: nextHints,
    links: nextLinks,
    allHints: opts.sentHints.slice(),
    allLinks: Array.from(opts.sentLinks)
  };
}
function createResponseLinkHeaderEntries(opts) {
  for (const hint of opts.hints) {
    const link = serializeEarlyHint(hint);
    if (opts.sentLinks.has(link)) continue;
    opts.sentLinks.add(link);
    opts.entries.push({
      phase: opts.phase,
      hint,
      link
    });
  }
}
function getResponseLinkHeaderEntries(opts) {
  if (!opts.filter) return opts.entries.map((entry) => entry.link);
  try {
    const links = [];
    for (const entry of opts.entries) if (opts.filter(entry)) links.push(entry.link);
    return links;
  } catch (err) {
    console.error("Error filtering response Link headers:", err);
    return [];
  }
}
function notifyEarlyHints(phase, event, onEarlyHints) {
  try {
    const result = onEarlyHints(event);
    if (result) Promise.resolve(result).catch((err) => {
      console.error(`Error sending ${phase} early hints:`, err);
    });
  } catch (err) {
    console.error(`Error sending ${phase} early hints:`, err);
  }
}
function getResponseLinkHeaderFilter(responseLinkHeader) {
  if (typeof responseLinkHeader !== "object") return;
  return responseLinkHeader.filter;
}
function appendResponseLinkHeaders(opts) {
  for (const link of getResponseLinkHeaderEntries(opts)) opts.responseHeaders.append("Link", link);
}
function collectResponseLinkHeaderEntries(opts) {
  for (let index = 0; index < opts.event.hints.length; index++) opts.entries.push({
    phase: opts.phase,
    hint: opts.event.hints[index],
    link: opts.event.links[index]
  });
}
function collectEarlyHintsPhase(opts) {
  const event = opts.onEarlyHints ? createEarlyHintsEvent({
    phase: opts.phase,
    hints: opts.hints,
    sentLinks: opts.sentLinks,
    sentHints: opts.sentHints
  }) : void 0;
  if (event) notifyEarlyHints(opts.phase, event, opts.onEarlyHints);
  if (!opts.responseLinkHeaderEntries) return;
  if (event) {
    collectResponseLinkHeaderEntries({
      phase: opts.phase,
      event,
      entries: opts.responseLinkHeaderEntries
    });
    return;
  }
  createResponseLinkHeaderEntries({
    phase: opts.phase,
    hints: opts.hints,
    sentLinks: opts.sentLinks,
    entries: opts.responseLinkHeaderEntries
  });
}
function createEarlyHintsCollector(opts) {
  if (!opts?.onEarlyHints && !opts?.responseLinkHeader) return;
  const sentLinks = /* @__PURE__ */ new Set();
  const sentHints = opts.onEarlyHints ? new Array() : void 0;
  const responseLinkHeaderEntries = opts.responseLinkHeader ? new Array() : void 0;
  const responseLinkHeaderFilter = getResponseLinkHeaderFilter(opts.responseLinkHeader);
  return {
    collectStatic: ({ manifest: manifest2, matchedRoutes }) => {
      if (!matchedRoutes?.length) return;
      collectEarlyHintsPhase({
        phase: "static",
        hints: collectStaticHintsFromManifest(manifest2, matchedRoutes),
        sentLinks,
        sentHints,
        onEarlyHints: opts.onEarlyHints,
        responseLinkHeaderEntries
      });
    },
    collectDynamic: (matches) => {
      collectEarlyHintsPhase({
        phase: "dynamic",
        hints: collectDynamicHintsFromMatches(matches),
        sentLinks,
        sentHints,
        onEarlyHints: opts.onEarlyHints,
        responseLinkHeaderEntries
      });
    },
    appendResponseHeaders: (headers) => {
      if (!responseLinkHeaderEntries?.length) return;
      appendResponseLinkHeaders({
        responseHeaders: headers,
        entries: responseLinkHeaderEntries,
        filter: responseLinkHeaderFilter
      });
    }
  };
}
function normalizeTransformAssetResult(result) {
  if (typeof result === "string") return { href: result };
  return result;
}
function escapeCssString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\a ").replace(/\r/g, "\\d ").replace(/\f/g, "\\c ");
}
async function transformInlineCssTemplate(options) {
  const { strings, urls } = options.template;
  if (strings.length !== urls.length + 1) throw new Error(`TanStack Start inlineCss template for ${options.stylesheetHref} is invalid`);
  let css = strings[0];
  for (let index = 0; index < urls.length; index++) {
    const transformed = normalizeTransformAssetResult(await options.transformFn({
      kind: "css-url",
      url: urls[index],
      stylesheetHref: options.stylesheetHref
    }));
    css += escapeCssString(transformed.href) + strings[index + 1];
  }
  return css;
}
async function transformInlineCssStyles(inlineCss, transformFn) {
  const transformedStyles = {};
  const transformedEntries = await Promise.all(Object.entries(inlineCss.styles).map(async ([stylesheetHref, css]) => {
    const template = inlineCss.templates?.[stylesheetHref];
    return [stylesheetHref, template ? await transformInlineCssTemplate({
      stylesheetHref,
      template,
      transformFn
    }) : css];
  }));
  for (const [stylesheetHref, css] of transformedEntries) transformedStyles[stylesheetHref] = css;
  return {
    styles: transformedStyles,
    ...inlineCss.templates ? { templates: inlineCss.templates } : {}
  };
}
function resolveTransformAssetsCrossOrigin(config, kind) {
  if (!config) return void 0;
  if (typeof config === "string") return config;
  return config[kind];
}
function isObjectShorthand(transform) {
  return "prefix" in transform;
}
function resolveTransformAssetsConfig(transform) {
  if (typeof transform === "string") {
    const prefix = transform;
    return {
      type: "transform",
      transformFn: ({ url }) => ({ href: `${prefix}${url}` }),
      cache: true
    };
  }
  if (typeof transform === "function") return {
    type: "transform",
    transformFn: transform,
    cache: true
  };
  if (isObjectShorthand(transform)) {
    const { prefix, crossOrigin } = transform;
    return {
      type: "transform",
      transformFn: ({ url, kind }) => {
        const href = `${prefix}${url}`;
        if (kind === "css-url") return { href };
        const co = resolveTransformAssetsCrossOrigin(crossOrigin, kind);
        return co ? {
          href,
          crossOrigin: co
        } : { href };
      },
      cache: true
    };
  }
  if ("createTransform" in transform && transform.createTransform) return {
    type: "createTransform",
    createTransform: transform.createTransform,
    cache: transform.cache !== false
  };
  return {
    type: "transform",
    transformFn: typeof transform.transform === "string" ? (({ url }) => ({ href: `${transform.transform}${url}` })) : transform.transform,
    cache: transform.cache !== false
  };
}
function assignManifestLink(link, next) {
  if (typeof link === "string") return next.crossOrigin ? next : next.href;
  const nextLink = {
    ...link,
    href: next.href
  };
  if (next.crossOrigin) nextLink.crossOrigin = next.crossOrigin;
  else delete nextLink.crossOrigin;
  return nextLink;
}
async function transformManifestAssets(source, transformFn, _opts) {
  const manifest2 = structuredClone(source);
  const inlineCssEnabled = _opts?.inlineCss !== false;
  const scriptTransforms = /* @__PURE__ */ new Map();
  const transformScript = (url) => {
    const cached = scriptTransforms.get(url);
    if (cached) return cached;
    const transformed = Promise.resolve(transformFn({
      url,
      kind: "script"
    })).then(normalizeTransformAssetResult);
    scriptTransforms.set(url, transformed);
    return transformed;
  };
  if (!inlineCssEnabled) delete manifest2.inlineCss;
  else if (manifest2.inlineCss) manifest2.inlineCss = await transformInlineCssStyles(manifest2.inlineCss, transformFn);
  for (const route of Object.values(manifest2.routes)) {
    if (route.preloads?.length) route.preloads = await Promise.all(route.preloads.map(async (link) => {
      const result = await transformScript(resolveManifestAssetLink(link).href);
      return assignManifestLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.css?.length && !manifest2.inlineCss) route.css = await Promise.all(route.css.map(async (link) => {
      const result = normalizeTransformAssetResult(await transformFn({
        url: resolveManifestCssLink(link).href,
        kind: "stylesheet"
      }));
      return assignManifestLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.scripts?.length) for (const script of route.scripts) {
      const src = script.attrs?.src;
      if (typeof src !== "string") continue;
      const result = await transformScript(src);
      script.attrs = {
        ...script.attrs,
        src: result.href
      };
      if (result.crossOrigin) script.attrs.crossOrigin = result.crossOrigin;
      else delete script.attrs.crossOrigin;
    }
  }
  return manifest2;
}
function buildManifest(source, opts) {
  return {
    ...source.scriptFormat ? { scriptFormat: source.scriptFormat } : {},
    ...opts?.inlineCss !== false && source.inlineCss ? { inlineCss: structuredClone(source.inlineCss) } : {},
    routes: { ...source.routes }
  };
}
function getStaticHandlerInlineCssDefault(handlerInlineCss) {
  if (typeof handlerInlineCss === "function") return;
  return handlerInlineCss ?? true;
}
async function resolveInlineCssForRequest(opts) {
  if (opts.requestInlineCss !== void 0) return opts.requestInlineCss;
  if (typeof opts.handlerInlineCss === "function") return await opts.handlerInlineCss({ request: opts.request });
  return opts.handlerInlineCss ?? true;
}
function createCachedBaseManifestLoader(loadBaseManifest) {
  let baseManifestPromise;
  return () => {
    if (!baseManifestPromise) baseManifestPromise = loadBaseManifest().catch((error) => {
      baseManifestPromise = void 0;
      throw error;
    });
    return baseManifestPromise;
  };
}
function createFinalManifestTransformResolver(transformAssets, opts) {
  const transformConfig = transformAssets !== void 0 ? resolveTransformAssetsConfig(transformAssets) : void 0;
  const cache = transformConfig ? transformConfig.cache : true;
  const warmup = !!transformAssets && typeof transformAssets === "object" && "warmup" in transformAssets && transformAssets.warmup === true;
  let cachedCreateTransformPromise;
  const clearCachedCreateTransform = () => {
    cachedCreateTransformPromise = void 0;
  };
  return {
    cache,
    warmup,
    clearCachedCreateTransform,
    getTransformFn: async (ctx) => {
      if (!transformConfig) return void 0;
      if (transformConfig.type !== "createTransform") return transformConfig.transformFn;
      if (!cache || false) return transformConfig.createTransform(ctx);
      if (!cachedCreateTransformPromise) cachedCreateTransformPromise = Promise.resolve(transformConfig.createTransform(ctx)).catch((error) => {
        clearCachedCreateTransform();
        throw error;
      });
      return cachedCreateTransformPromise;
    }
  };
}
function createFinalManifestResolver(opts) {
  const finalManifestCache = /* @__PURE__ */ new Map();
  const transformResolver = createFinalManifestTransformResolver(opts.transformAssets);
  const handlerDefaultInlineCss = getStaticHandlerInlineCssDefault(opts.inlineCss);
  const getRequestManifestOptions = async (requestOpts) => {
    const transformFn = await transformResolver.getTransformFn({
      warmup: false,
      request: requestOpts.request
    });
    const inlineCss = await resolveInlineCssForRequest({
      request: requestOpts.request,
      handlerInlineCss: opts.inlineCss,
      requestInlineCss: requestOpts.requestInlineCss
    });
    return {
      getBaseManifest: requestOpts.getBaseManifest,
      transformFn,
      cache: transformResolver.cache,
      inlineCss
    };
  };
  const resolveRequest = async (requestOpts, cache) => {
    return resolveFinalManifest({
      ...await getRequestManifestOptions(requestOpts),
      finalManifestCache: cache
    });
  };
  return {
    warmup: ({ getBaseManifest: getBaseManifest2 }) => warmupFinalManifest({
      enabled: transformResolver.warmup,
      handlerDefaultInlineCss,
      cache: transformResolver.cache,
      finalManifestCache,
      getBaseManifest: getBaseManifest2,
      getTransformFn: () => transformResolver.getTransformFn({ warmup: true }),
      onError: transformResolver.clearCachedCreateTransform
    }),
    resolveCached: (requestOpts) => resolveRequest(requestOpts, finalManifestCache),
    resolveUncached: (requestOpts) => resolveRequest(requestOpts, void 0)
  };
}
function getFinalManifestCacheKey(inlineCss) {
  return inlineCss ? "inline-css" : "linked-css";
}
function cacheFinalManifestPromise(cachedFinalManifestPromises, cacheKey, promise) {
  const cachedFinalManifestPromise = promise.catch((error) => {
    if (cachedFinalManifestPromises.get(cacheKey) === cachedFinalManifestPromise) cachedFinalManifestPromises.delete(cacheKey);
    throw error;
  });
  cachedFinalManifestPromises.set(cacheKey, cachedFinalManifestPromise);
  return cachedFinalManifestPromise;
}
function getOrCreateCachedFinalManifestPromise(cachedFinalManifestPromises, cacheKey, computeFinalManifest) {
  const cachedFinalManifestPromise = cachedFinalManifestPromises.get(cacheKey);
  if (cachedFinalManifestPromise) return cachedFinalManifestPromise;
  return cacheFinalManifestPromise(cachedFinalManifestPromises, cacheKey, Promise.resolve().then(computeFinalManifest));
}
async function buildFinalManifest(opts) {
  return opts.transformFn ? await transformManifestAssets(opts.base, opts.transformFn, { inlineCss: opts.inlineCss }) : buildManifest(opts.base, { inlineCss: opts.inlineCss });
}
async function resolveFinalManifest(opts) {
  const computeFinalManifest = async () => {
    return buildFinalManifest({
      base: await opts.getBaseManifest(),
      transformFn: opts.transformFn,
      inlineCss: opts.inlineCss
    });
  };
  if (opts.finalManifestCache && (!opts.transformFn || opts.cache)) return getOrCreateCachedFinalManifestPromise(opts.finalManifestCache, getFinalManifestCacheKey(opts.inlineCss), computeFinalManifest);
  return computeFinalManifest();
}
function warmupFinalManifest(opts) {
  if (!opts.enabled || opts.handlerDefaultInlineCss === void 0 || !opts.cache) return;
  const inlineCss = opts.handlerDefaultInlineCss;
  const warmupPromise = getOrCreateCachedFinalManifestPromise(opts.finalManifestCache, getFinalManifestCacheKey(inlineCss), async () => {
    const [base, transformFn] = await Promise.all([opts.getBaseManifest(), opts.getTransformFn()]);
    return buildFinalManifest({
      base,
      transformFn,
      inlineCss
    });
  });
  if (opts.onError) warmupPromise.catch(opts.onError);
  return warmupPromise;
}
var ServerFunctionSerializationAdapter = createSerializationAdapter({
  key: "$TSS/serverfn",
  test: (v) => {
    if (typeof v !== "function") return false;
    if (!(TSS_SERVER_FUNCTION in v)) return false;
    return !!v[TSS_SERVER_FUNCTION];
  },
  toSerializable: ({ serverFnMeta }) => ({ functionId: serverFnMeta.id }),
  fromSerializable: ({ functionId }) => {
    const fn = async (opts, signal) => {
      const serverFn = await getServerFnById(functionId);
      const result = await serverFn({
        data: opts?.data,
        context: opts?.context,
        method: serverFn.method ?? "GET"
      }, signal);
      if (result.error !== void 0) throw result.error;
      return result.result;
    };
    return fn;
  }
});
function getStartResponseHeaders(opts) {
  return mergeHeaders({ "Content-Type": "text/html; charset=utf-8" }, ..._getRenderedMatches(opts.router.stores.matches.get()).map((match) => {
    return match.headers;
  }));
}
var entriesPromise;
var defaultCsrfMiddleware = createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === "serverFn" });
var getCachedBaseManifest = createCachedBaseManifestLoader(() => getStartManifest());
var getProdBaseManifest = () => getCachedBaseManifest();
var getBaseManifest = getProdBaseManifest;
var createEarlyHintsForRequest = createEarlyHintsCollector;
async function loadEntries() {
  const [routerEntry, startEntry, pluginAdapters] = await Promise.all([
    import("./router-CkmTURa-.mjs").then((n) => n.cj),
    import("./start-R-CCsVab.mjs"),
    import("./empty-plugin-adapters-BFgPZ6_d.mjs")
  ]);
  return {
    routerEntry,
    startEntry,
    pluginAdapters
  };
}
function getEntries() {
  if (!entriesPromise) entriesPromise = loadEntries();
  return entriesPromise;
}
var ROUTER_BASEPATH = "/";
var SERVER_FN_BASE = "/_serverFn/";
var IS_PRERENDERING = process.env.TSS_PRERENDERING === "true";
var IS_SHELL_ENV = process.env.TSS_SHELL === "true";
var ERR_NO_RESPONSE = "Internal Server Error";
var ERR_NO_DEFER = "Internal Server Error";
function throwRouteHandlerError() {
  throw new Error(ERR_NO_RESPONSE);
}
function throwIfMayNotDefer() {
  throw new Error(ERR_NO_DEFER);
}
function getResponseFromResult(result) {
  return isSsrResponse(result) || result instanceof Response ? result : result?.response;
}
var responseBodySources = /* @__PURE__ */ new WeakMap();
function disposeResponseResult(result, reason) {
  const response = getResponseFromResult(result);
  if (isSsrResponse(response) || response instanceof Response) disposeSsrResponse(response, reason);
}
function hasResponseBody(value) {
  return value instanceof Response && value.body !== null;
}
function inheritsResponseOwnership(ownership, candidate) {
  return hasResponseBody(candidate) && (candidate.body === ownership.response.body || responseBodySources.get(candidate) === ownership.response);
}
function disposeResponseOwnership(ownership, reason) {
  const { response, sourceBody, streamResponse } = ownership;
  streamResponse?.dispose(reason);
  if (!streamResponse || response.body !== sourceBody) response.body.cancel(reason).catch(() => {
  });
}
function getOwnedResponse(ownership) {
  const { response, sourceBody, streamResponse } = ownership;
  if (!streamResponse) return response;
  if (streamResponse.response === response && response.body === sourceBody) return streamResponse;
  if (response.body === sourceBody) return {
    ...streamResponse,
    response
  };
  return {
    ...streamResponse,
    response,
    dispose(reason) {
      disposeResponseOwnership(ownership, reason);
    }
  };
}
function createLateResponseDisposer(signal) {
  return (result) => disposeResponseResult(result, signal.reason);
}
async function executeMiddleware(middlewares, terminal, ctx, signal, terminalNext) {
  let index = -1;
  let responseOwnership;
  let settled = false;
  const disposeAbandonedResult = createLateResponseDisposer(signal);
  const setResponse = (response) => {
    const ssrResponse = isSsrResponse(response) ? response : void 0;
    const streamResponse = ssrResponse?.serverSsrCleanup === "stream" ? ssrResponse : void 0;
    const exposed = ssrResponse ? ssrResponse.response : response;
    const current = responseOwnership;
    if (settled) {
      if (exposed !== ctx.response) disposeResponseResult(response, "late middleware response");
      return;
    }
    if (current && current.response === exposed) current.streamResponse ??= streamResponse;
    else if (current && inheritsResponseOwnership(current, exposed)) {
      current.response = exposed;
      current.streamResponse ??= streamResponse;
    } else {
      if (current) disposeResponseOwnership(current, "middleware response replaced");
      if (hasResponseBody(exposed)) responseOwnership = {
        response: exposed,
        sourceBody: exposed.body,
        streamResponse
      };
      else responseOwnership = void 0;
    }
    ctx.response = exposed;
  };
  const reconcileCtxResponse = () => {
    if (ctx.response !== responseOwnership?.response) setResponse(ctx.response);
  };
  let nextPromise;
  function next(nextCtx) {
    const result = runNext(nextCtx);
    nextPromise = result;
    return result;
  }
  async function runNext(nextCtx) {
    signal.throwIfAborted();
    if (nextCtx) {
      if (nextCtx.context) ctx.context = safeObjectMerge(ctx.context, nextCtx.context);
      for (const key of Object.keys(nextCtx)) if (key === "response") setResponse(nextCtx.response);
      else if (key !== "context") ctx[key] = nextCtx[key];
    }
    index++;
    const isTerminal = index === middlewares.length;
    const middleware = index < middlewares.length ? middlewares[index] : isTerminal ? terminal : void 0;
    const middlewareNext = isTerminal && terminalNext ? terminalNext : next;
    if (!middleware) return ctx;
    let result;
    try {
      const pending = middleware({
        ...ctx,
        next: middlewareNext
      });
      if (nextPromise && pending === nextPromise) {
        nextPromise = void 0;
        await pending;
        if (signal.aborted) throw signal.reason;
        return ctx;
      } else if (!isPromise(pending)) {
        result = pending;
        signal.throwIfAborted();
      } else result = await waitForReason(pending, signal, disposeAbandonedResult, disposeAbandonedResult);
    } catch (err) {
      reconcileCtxResponse();
      if (signal.aborted) {
        if (result !== void 0) disposeAbandonedResult(result);
        if (err !== signal.reason) disposeAbandonedResult(err);
        throw signal.reason;
      }
      if (err instanceof Response) {
        setResponse(err);
        return ctx;
      }
      throw err;
    }
    if (isTerminal && terminalNext && !result) throwRouteHandlerError();
    reconcileCtxResponse();
    if (result && result !== ctx) {
      const response = getResponseFromResult(result);
      if (response !== void 0 && response !== ctx.response) setResponse(response);
      if (response !== result && result.context && result.context !== ctx.context) ctx.context = safeObjectMerge(ctx.context, result.context);
    }
    return ctx;
  }
  try {
    await runNext();
    const response = ctx.response;
    if (!response) throwRouteHandlerError();
    reconcileCtxResponse();
    if (signal.aborted) throw signal.reason;
    settled = true;
    return responseOwnership ? getOwnedResponse(responseOwnership) : response;
  } catch (err) {
    settled = true;
    if (responseOwnership) disposeResponseOwnership(responseOwnership, signal.aborted ? signal.reason : err);
    throw err;
  }
}
function createStartHandler(cbOrOptions) {
  const handlerOptions = typeof cbOrOptions === "function" ? {} : cbOrOptions;
  const cb = typeof cbOrOptions === "function" ? cbOrOptions : cbOrOptions.handler;
  const finalManifestResolver = createFinalManifestResolver({
    ...handlerOptions
  });
  const resolveManifestForRequest = finalManifestResolver.resolveCached;
  finalManifestResolver.warmup({ getBaseManifest: () => getBaseManifest() });
  const startRequestResolver = async (request, requestOpts) => {
    const signal = request.signal;
    let router;
    let routerPromise;
    let responseOwnsCleanup = false;
    try {
      signal.throwIfAborted();
      const { url, handledProtocolRelativeURL } = getNormalizedURL(request.url);
      const href = url.pathname + url.search + url.hash;
      const origin = url.origin;
      if (handledProtocolRelativeURL) return Response.redirect(url, 308);
      const entries = await waitForReason(getEntries(), signal);
      const isServerFnRequest = !!SERVER_FN_BASE && url.pathname.startsWith(SERVER_FN_BASE);
      const startInstance = entries.startEntry.startInstance;
      let startOptions;
      if (startInstance) {
        const pendingStartOptions = startInstance.getOptions();
        startOptions = isPromise(pendingStartOptions) ? await waitForReason(pendingStartOptions, signal) : pendingStartOptions;
        signal.throwIfAborted();
      } else startOptions = {};
      const { hasPluginAdapters, pluginSerializationAdapters } = entries.pluginAdapters;
      const serializationAdapters = [
        ...startOptions.serializationAdapters || [],
        ...hasPluginAdapters ? pluginSerializationAdapters : [],
        ServerFunctionSerializationAdapter
      ];
      const requestStartOptions = {
        ...startOptions,
        requestMiddleware: startInstance ? startOptions.requestMiddleware : isServerFnRequest ? [defaultCsrfMiddleware] : void 0,
        serializationAdapters
      };
      const flattenedRequestMiddlewares = requestStartOptions.requestMiddleware ? flattenMiddlewares(requestStartOptions.requestMiddleware) : [];
      const executedRequestMiddlewares = new Set(flattenedRequestMiddlewares);
      const getRouter = () => {
        routerPromise ??= (async () => {
          signal.throwIfAborted();
          const requestRouter = await waitForReason(entries.routerEntry.getRouter(), signal);
          let isShell = IS_SHELL_ENV;
          if (IS_PRERENDERING && !isShell) isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
          const history = createServerHistory(href);
          requestRouter.update({
            history,
            isShell,
            isPrerendering: IS_PRERENDERING,
            origin: requestRouter.options.origin ?? origin,
            defaultSsr: requestStartOptions.defaultSsr,
            serializationAdapters: [...requestStartOptions.serializationAdapters, ...requestRouter.options.serializationAdapters || []],
            basepath: ROUTER_BASEPATH
          });
          router = requestRouter;
          return requestRouter;
        })();
        return routerPromise;
      };
      const handlerType = isServerFnRequest ? "serverFn" : "router";
      const startContext = {
        getRouter,
        startOptions: requestStartOptions,
        request,
        executedRequestMiddlewares,
        handlerType
      };
      let terminal;
      if (isServerFnRequest) {
        if (false) ;
        const serverFnId = url.pathname.slice(SERVER_FN_BASE.length).split("/")[0];
        if (!serverFnId) throw new Error("Invalid server action param for serverFnId");
        terminal = ({ context }) => runWithStartContext({
          ...startContext,
          contextAfterGlobalMiddlewares: context
        }, () => handleServerAction({
          request,
          context: requestOpts?.context,
          serverFnId
        }));
      } else {
        const executeRouter = async (serverContext, matchedRoutes) => {
          if (!/(^|,)\s*(\*\/\*|text\/html)/.test(request.headers.get("Accept") || "*/*")) return normalizeSsrResponse(Response.json({ error: "Only HTML requests are supported here" }, { status: 406 }));
          const manifest2 = await waitForReason(resolveManifestForRequest({
            request,
            requestInlineCss: requestOpts?.inlineCss,
            getBaseManifest: () => getBaseManifest(matchedRoutes)
          }), signal);
          const earlyHints = createEarlyHintsForRequest({
            onEarlyHints: requestOpts?.onEarlyHints,
            responseLinkHeader: requestOpts?.responseLinkHeader
          });
          earlyHints?.collectStatic({
            manifest: manifest2,
            matchedRoutes
          });
          const routerInstance = await getRouter();
          attachRouterServerSsrUtils({
            router: routerInstance,
            manifest: manifest2,
            getRequestAssets: () => getStartContext({ throwIfNotFound: false })?.requestAssets
          });
          routerInstance.options.additionalContext = { serverContext };
          await routerInstance.load({ _signal: signal });
          signal.throwIfAborted();
          if (routerInstance._serverResult?.type === "redirect") return normalizeSsrResponse(routerInstance._serverResult.redirect);
          earlyHints?.collectDynamic(_getRenderedMatches(routerInstance.stores.matches.get()));
          const ctx = getStartContext({ throwIfNotFound: false });
          await routerInstance.serverSsr.dehydrate({
            requestAssets: ctx?.requestAssets,
            signal
          });
          signal.throwIfAborted();
          const responseHeaders = getStartResponseHeaders({ router: routerInstance });
          earlyHints?.appendResponseHeaders(responseHeaders);
          signal.throwIfAborted();
          const disposeLate = createLateResponseDisposer(signal);
          return normalizeSsrResponse(await waitForReason(cb({
            request,
            router: routerInstance,
            responseHeaders
          }), signal, disposeLate, disposeLate));
        };
        terminal = ({ context }) => runWithStartContext({
          ...startContext,
          contextAfterGlobalMiddlewares: context
        }, () => handleServerRoutes({
          getRouter,
          request,
          url,
          executeRouter,
          context,
          executedRequestMiddlewares
        }));
      }
      const middlewareResponse = await executeMiddleware(flattenedRequestMiddlewares.map((d) => d.options.server), terminal, {
        request,
        pathname: url.pathname,
        handlerType,
        context: createNullProtoObject(requestOpts?.context)
      }, signal);
      let result;
      try {
        result = await handleRedirectResponse(middlewareResponse, getRouter, signal, isServerFnRequest && request.headers.get("x-tsr-serverFn") === "true");
        if (request.method === "HEAD") result = stripSsrResponseBody(result, "HEAD body stripped");
      } catch (error) {
        disposeResponseResult(middlewareResponse, signal.aborted ? signal.reason : error);
        throw error;
      }
      bindSsrResponseToRequest(router, result, signal);
      signal.throwIfAborted();
      responseOwnsCleanup = result.serverSsrCleanup === "stream";
      return result.response;
    } finally {
      if (router?.serverSsr && !responseOwnsCleanup) router.serverSsr.cleanup();
    }
  };
  return requestHandler(startRequestResolver);
}
var relativeRedirectProtocols = /* @__PURE__ */ new Set();
async function handleRedirectResponse(response, getRouter, signal, serializeRedirect) {
  signal.throwIfAborted();
  const ssrResponse = normalizeSsrResponse(response);
  const redirect = ssrResponse.response;
  if (!isRedirect(redirect)) return ssrResponse;
  const opts = redirect.options;
  const href = redirect.headers.get("Location") || opts.href;
  if (!href && opts.to && typeof opts.to === "string" && !opts.to.startsWith("/")) throw new Error(`Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(opts)}`);
  if (!href && [
    "params",
    "search",
    "hash"
  ].some((d) => typeof opts[d] === "function")) throw new Error(`Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(opts).filter((d) => typeof opts[d] === "function").map((d) => `"${d}"`).join(", ")}`);
  signal.throwIfAborted();
  if (href && !isDangerousProtocol(href, relativeRedirectProtocols)) {
    opts.href = href;
    redirect.headers.set("Location", href);
  } else {
    const router = await getRouter();
    signal.throwIfAborted();
    router.resolveRedirect(redirect);
  }
  if (serializeRedirect) {
    const redirectOptions = { ...opts };
    delete redirectOptions.headers;
    const responseHeaders = new Headers(redirect.headers);
    responseHeaders.set("content-type", "application/json");
    return replaceSsrResponse(ssrResponse, Response.json({
      ...redirectOptions,
      isSerializedRedirect: true
    }, { headers: responseHeaders }), "redirect response replaced");
  }
  return ssrResponse;
}
function withParsedParams(handler, matchedRoutes) {
  if (!matchedRoutes.some((route) => route.options.params?.parse ?? route.options.parseParams)) return handler;
  return (ctx) => {
    const params = Object.assign(/* @__PURE__ */ Object.create(null), ctx.params);
    for (const route of matchedRoutes) {
      const parse = route.options.params?.parse ?? route.options.parseParams;
      if (parse) Object.assign(params, parse(params));
    }
    return handler({
      ...ctx,
      params
    });
  };
}
async function handleServerRoutes({ getRouter, request, url, executeRouter, context, executedRequestMiddlewares }) {
  const router = await getRouter();
  const pathname = executeRewriteInput(router.rewrite, url).pathname;
  const [matchedRoutes, rawParams, foundRoute] = router.getMatchedRoutes(pathname);
  const isExactMatch = foundRoute && rawParams["**"] === void 0;
  const routeMiddlewares = [];
  let terminalHandler = (ctx) => executeRouter(ctx.context, matchedRoutes);
  let terminalNext;
  for (const route of matchedRoutes) {
    const serverMiddleware = route.options.server?.middleware;
    if (serverMiddleware) {
      const flattened = flattenMiddlewares(serverMiddleware);
      for (const m of flattened) if (!executedRequestMiddlewares.has(m)) routeMiddlewares.push(m.options.server);
    }
  }
  const server2 = foundRoute?.options.server;
  if (server2?.handlers && isExactMatch) {
    const handlers = typeof server2.handlers === "function" ? server2.handlers({ createHandlers: (d) => d }) : server2.handlers;
    const requestMethod = request.method.toUpperCase();
    const handler = requestMethod === "HEAD" ? handlers["HEAD"] ?? handlers["GET"] ?? handlers["ANY"] : handlers[requestMethod] ?? handlers["ANY"];
    if (handler) {
      const mayDefer = !!foundRoute.options.component;
      if (typeof handler !== "function") {
        if (handler.middleware?.length) {
          const handlerMiddlewares = flattenMiddlewares(handler.middleware);
          for (const m of handlerMiddlewares) routeMiddlewares.push(m.options.server);
        }
      }
      const routeHandler = typeof handler === "function" ? handler : handler.handler;
      if (routeHandler) {
        const parsedHandler = withParsedParams(routeHandler, matchedRoutes);
        if (!mayDefer) {
          terminalHandler = parsedHandler;
          terminalNext = throwIfMayNotDefer;
        } else routeMiddlewares.push(parsedHandler);
      }
    }
  }
  return normalizeSsrResponse(await executeMiddleware(routeMiddlewares, terminalHandler, {
    request,
    context,
    params: rawParams,
    pathname,
    handlerType: "router"
  }, request.signal, terminalNext));
}
var fetch = createStartHandler(defaultStreamHandler);
function createServerEntry(entry) {
  return { async fetch(...args) {
    return await entry.fetch(...args);
  } };
}
var server_default = createServerEntry({ fetch });
const server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createServerEntry,
  default: server_default
}, Symbol.toStringTag, { value: "Module" }));
export {
  TSS_SERVER_FUNCTION as T,
  createMiddleware as a,
  createCsrfMiddleware as b,
  createServerFn as c,
  getRequest as d,
  getServerFnById as g,
  server as s
};
