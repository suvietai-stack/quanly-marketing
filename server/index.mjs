globalThis.__nitro_main__ = import.meta.url;
import { c as NodeResponse, s as serve } from "./_libs/srvx.mjs";
import { d as defineHandler, H as HTTPError, t as toEventHandler, a as defineLazyEventHandler, b as H3Core } from "./_libs/h3.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "./_libs/rou3.mjs";
function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const headers = ((m) => function headersRouteRule(event) {
  for (const [key2, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key2, value);
  }
});
const assets = {
  "/icon-192.png": {
    "type": "image/png",
    "etag": '"36b4-YWcDOSbaLkUhiVoCrebY+LQ8qVE"',
    "mtime": "2026-11-21T06:26:32.997Z",
    "size": 14004,
    "path": "../public/icon-192.png"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": '"7d9a-4mSHCe5VbanBYlE54tKxcs8Zz3s"',
    "mtime": "2026-11-21T06:26:32.996Z",
    "size": 32154,
    "path": "../public/favicon.ico"
  },
  "/manifest.webmanifest": {
    "type": "application/manifest+json",
    "etag": '"156-YQazqEnYO2sweEgBE5bi4FFdSEc"',
    "mtime": "2026-11-21T06:26:33.000Z",
    "size": 342,
    "path": "../public/manifest.webmanifest"
  },
  "/icon-512.png": {
    "type": "image/png",
    "etag": '"d90d-UP4IyUkRtC/OyUZa3DaU9rnV0Cs"',
    "mtime": "2026-11-21T06:26:32.997Z",
    "size": 55565,
    "path": "../public/icon-512.png"
  },
  "/push-sw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4d8-W2lClFmR2t00ZIo7niFiQyWSNJY"',
    "mtime": "2026-11-21T06:26:33.000Z",
    "size": 1240,
    "path": "../public/push-sw.js"
  },
  "/zalo_verifierFFcN8jha9pKHv94EsCa53Y_FjYt3kMrpE34r.html": {
    "type": "text/html; charset=utf-8",
    "etag": '"e9-0msWlQLZoGsdVHn5aYRcZwE/oDw"',
    "mtime": "2026-11-21T06:26:33.000Z",
    "size": 233,
    "path": "../public/zalo_verifierFFcN8jha9pKHv94EsCa53Y_FjYt3kMrpE34r.html"
  },
  "/downloads/suviet-base-chat.zip": {
    "type": "application/zip",
    "etag": '"6447-MR8R00/QgOzd9R1tnW9YjAMz1cs"',
    "mtime": "2026-11-21T06:26:32.996Z",
    "size": 25671,
    "path": "../public/downloads/suviet-base-chat.zip"
  },
  "/assets/AccountsSettings-BS3pnJC3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7272-mxRgSsYDDXSoa1lbj6qMEqSI1BI"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 29298,
    "path": "../public/assets/AccountsSettings-BS3pnJC3.js"
  },
  "/assets/AppointmentPermissionSummary-GSOsARvR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d2b-TEqhbBzB3cfMX7JCTJyCUxzr5qs"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 3371,
    "path": "../public/assets/AppointmentPermissionSummary-GSOsARvR.js"
  },
  "/assets/BizDeadlineEditor-Bds9hrRR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2edb-EMBEtvtFieeLA+hkY0HFrsKitpc"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 11995,
    "path": "../public/assets/BizDeadlineEditor-Bds9hrRR.js"
  },
  "/assets/BizDocuments-CRTwi9-I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ceb0-TdebzqgcjHGXZqC9NqXPucGlbZQ"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 52912,
    "path": "../public/assets/BizDocuments-CRTwi9-I.js"
  },
  "/assets/Biz3K-BZIBk0Ck.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"28317-+FRn9nRos0nCBAEoTtIzfVKFLQw"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 164631,
    "path": "../public/assets/Biz3K-BZIBk0Ck.js"
  },
  "/assets/BizLateRequest-CxspOEke.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ef5-WBsAS3WLp0frjNbVt+vvGJbqJJs"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 3829,
    "path": "../public/assets/BizLateRequest-CxspOEke.js"
  },
  "/assets/CartesianGrid-CyB3zGUm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a66-+Xp48switde5303GninWAwgqDdk"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 6758,
    "path": "../public/assets/CartesianGrid-CyB3zGUm.js"
  },
  "/assets/ChangePasswordForm-JiQwSlPc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"844-BXusjbvzEIW/3I5BlpnVJW7QZtI"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 2116,
    "path": "../public/assets/ChangePasswordForm-JiQwSlPc.js"
  },
  "/assets/BarChart-DQA51e7N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5c3bf-3eOpyJQoaaMkXpBprh5Kp2Qi7nE"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 377791,
    "path": "../public/assets/BarChart-DQA51e7N.js"
  },
  "/assets/ChatPanel-CBxKEHm7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4d34-899dpr0JDtcZZRfb7nLIc2un6Wo"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 19764,
    "path": "../public/assets/ChatPanel-CBxKEHm7.js"
  },
  "/assets/ChipiAssistant-BvcisUJb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"60a4-AGrXli/O7eTnvAbsfZqMwdpIlFw"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 24740,
    "path": "../public/assets/ChipiAssistant-BvcisUJb.js"
  },
  "/assets/Common-elLkx-UL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"62f-lN84IiX8vL8srQSb0RAS3BpJpeE"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 1583,
    "path": "../public/assets/Common-elLkx-UL.js"
  },
  "/assets/CommunityFeed-D8jr058x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3fe4-ouUyjzogC6dfJ2/hOWWeXdeqXm4"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 16356,
    "path": "../public/assets/CommunityFeed-D8jr058x.js"
  },
  "/assets/ConfirmationDialog-BgIkiNyB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5c7-SrkDjz3I92pNJzsmXk8sYGwru5M"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 1479,
    "path": "../public/assets/ConfirmationDialog-BgIkiNyB.js"
  },
  "/assets/ContentForm-YNDNYrw6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4491-go2eAVq0+KGV5vIZmXQ16Ye7zPU"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 17553,
    "path": "../public/assets/ContentForm-YNDNYrw6.js"
  },
  "/assets/ContentDetail-Y7EiGPMi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"82a0-2T0tiGAXH/Fs5Uga4AWqdiBP5lU"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 33440,
    "path": "../public/assets/ContentDetail-Y7EiGPMi.js"
  },
  "/assets/DesignAssigneePicker-V_RgHJqh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1027-daO7dRxfqmgeLGTpCOpo1BNnPNc"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 4135,
    "path": "../public/assets/DesignAssigneePicker-V_RgHJqh.js"
  },
  "/assets/DesignReviewerPicker-627uX_pr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"94a-W3PDdF+qTm+Jzx1RZS6A0RptVlE"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 2378,
    "path": "../public/assets/DesignReviewerPicker-627uX_pr.js"
  },
  "/assets/DesignWork-DRfzUFzb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"160cf-7EevyGLHJh+VEQ/kcMgFG8minFc"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 90319,
    "path": "../public/assets/DesignWork-DRfzUFzb.js"
  },
  "/assets/FbLeadsSettings-Dmgaem7Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7662-w05mGnQpJwO4T9BTS/ZPT3gj2U8"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 30306,
    "path": "../public/assets/FbLeadsSettings-Dmgaem7Z.js"
  },
  "/assets/FinanceRequests-K5cPo5wS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"114f3-v0Xa035ieZmOzoEdSuhf8vPTEmI"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 70899,
    "path": "../public/assets/FinanceRequests-K5cPo5wS.js"
  },
  "/assets/JobTimes-DvSLyAiy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2b25-Z1ovnaWopNEdIZUi7SA3ke08SQA"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 11045,
    "path": "../public/assets/JobTimes-DvSLyAiy.js"
  },
  "/assets/K3CommonWorkspace-BBi8URaB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"76b8-ykrgC3JqjC2byNXu+GwcSWEMAzM"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 30392,
    "path": "../public/assets/K3CommonWorkspace-BBi8URaB.js"
  },
  "/assets/FunctionSettings-By41kUko.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1370-upqN0hOWxt6w8fZyhSbhkdkCfT8"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 4976,
    "path": "../public/assets/FunctionSettings-By41kUko.js"
  },
  "/assets/KpiV2-BXAmG_jO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"143e5-Hp2WgsJQX8tN+tKvj/XgRW4KyoI"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 82917,
    "path": "../public/assets/KpiV2-BXAmG_jO.js"
  },
  "/assets/LeaveReport-Bco5MJsy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"453d-psZWqzPXL+hMkerzfO3xELoUIBU"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 17725,
    "path": "../public/assets/LeaveReport-Bco5MJsy.js"
  },
  "/assets/LeaveSettings-Cu527nfJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7b1f-7GVVkZtGc94oqu9cOzDZsVofvlY"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 31519,
    "path": "../public/assets/LeaveSettings-Cu527nfJ.js"
  },
  "/assets/Line-DmlyHL5x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2ab1-zrRMJdR4TbS3J78ak+4oPzxLdQM"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 10929,
    "path": "../public/assets/Line-DmlyHL5x.js"
  },
  "/assets/LineChart-CsgR2J7h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"106-oI3wojYyZZyW9x42IiAbOI3Njmc"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 262,
    "path": "../public/assets/LineChart-CsgR2J7h.js"
  },
  "/assets/ManualEntry-piLATtBn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"26f0-jRB+STraZFjFxNze3VJ3AP/+rBI"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 9968,
    "path": "../public/assets/ManualEntry-piLATtBn.js"
  },
  "/assets/OrgChart-BRPa4iw6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3c2b-4ORpWg00clVtbYXsU4CTJ/xe8uA"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 15403,
    "path": "../public/assets/OrgChart-BRPa4iw6.js"
  },
  "/assets/OqCommon-D-g6PqtP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1f1c-N5L/ls7w8kudLoyawawUcCwY/qo"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 7964,
    "path": "../public/assets/OqCommon-D-g6PqtP.js"
  },
  "/assets/OrgUnitDrawer-DirND21d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"33e1-+fVwH5ZFj5VpzzoIa5+eDLrsQCg"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 13281,
    "path": "../public/assets/OrgUnitDrawer-DirND21d.js"
  },
  "/assets/OrganizationAppointment-BMOXwnkq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"176a-hE0mKjsAg1sLvCuQWz8KSvEn64E"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 5994,
    "path": "../public/assets/OrganizationAppointment-BMOXwnkq.js"
  },
  "/assets/OverviewV2-D7j21ukD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"63e8-Pz1vq5yMPn/VyuebHgvfqx2LWCY"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 25576,
    "path": "../public/assets/OverviewV2-D7j21ukD.js"
  },
  "/assets/PermissionCleanup-BPZBkEm0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2bf0-SC0p1CG4EF4xJQnHMT6URQv1s+g"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 11248,
    "path": "../public/assets/PermissionCleanup-BPZBkEm0.js"
  },
  "/assets/PermissionGate-Butw7pgX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"410-XrdjC6nLdYHiSpd8vQTmLdpd17E"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 1040,
    "path": "../public/assets/PermissionGate-Butw7pgX.js"
  },
  "/assets/OrganizationChange-BPh_cn3G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8fc-7WI6i0mtUh8+QOM//vPFvgXE4Nk"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 2300,
    "path": "../public/assets/OrganizationChange-BPh_cn3G.js"
  },
  "/assets/PersonalPerformance-DTI3j6iG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"354e-YnaB+ezj/sIjot5xZ+yzsWtOwg8"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 13646,
    "path": "../public/assets/PersonalPerformance-DTI3j6iG.js"
  },
  "/assets/PieChart-B0MfO1K9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"657b-CnyrW/IeTCMFS84hfxbJ3ahWlto"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 25979,
    "path": "../public/assets/PieChart-B0MfO1K9.js"
  },
  "/assets/RewardPopup-CahFK-MM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b11-tu0CJy0dvmdg/4DyeYE2TUzhqcw"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 2833,
    "path": "../public/assets/RewardPopup-CahFK-MM.js"
  },
  "/assets/RoleCatalog-BleMs2Bz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4c92-5PMHu10h2oXMHK4T8gva2Saawtw"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 19602,
    "path": "../public/assets/RoleCatalog-BleMs2Bz.js"
  },
  "/assets/SaoPages-7kq0eYq-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5cd5-tJ5eYMennOG2/hqJ8bffjAOKchk"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 23765,
    "path": "../public/assets/SaoPages-7kq0eYq-.js"
  },
  "/assets/SocialPostDetail-B5SXoH2P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e90-AlkZOt7kOBEdZ6nTIT1icKXf9mo"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 11920,
    "path": "../public/assets/SocialPostDetail-B5SXoH2P.js"
  },
  "/assets/SpecialtyStaffPicker-DveeBV11.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"73f-JoFA5FM5Or/GPz7fe/rS9EF+qKI"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 1855,
    "path": "../public/assets/SpecialtyStaffPicker-DveeBV11.js"
  },
  "/assets/SignalsUi-C_lb4QCk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1462a-nS7ojmOkcqBJFQHXgrvierFk0IU"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 83498,
    "path": "../public/assets/SignalsUi-C_lb4QCk.js"
  },
  "/assets/StaffPermissionEditor-Df6HWNbB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6c0b-yAfXRRNOcZb2KRVYiibsy7MamGE"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 27659,
    "path": "../public/assets/StaffPermissionEditor-Df6HWNbB.js"
  },
  "/assets/StatusBadge-lZn5zTlD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1832-dSaVUjZSWYnGv6iGOuBPgnJtT9Y"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 6194,
    "path": "../public/assets/StatusBadge-lZn5zTlD.js"
  },
  "/assets/TitleRoleDefaults-B1QkTj69.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1abc-GwdV3/IBfFbEEw7dZFjNWOXEEN8"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 6844,
    "path": "../public/assets/TitleRoleDefaults-B1QkTj69.js"
  },
  "/assets/ai-knowledge-Czcs25NR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4185-waLimCYH1kL60gy3CGHU9o40VSE"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 16773,
    "path": "../public/assets/ai-knowledge-Czcs25NR.js"
  },
  "/assets/ZaloInteractionReminder-BlkqNn2m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"141a-GL7XMwSvZw0LuFBS9lrDEP+LDCI"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 5146,
    "path": "../public/assets/ZaloInteractionReminder-BlkqNn2m.js"
  },
  "/assets/alert-dialog-CEgO3Qis.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"123f-tzH0hN1UCavUI4vVbEN3IP7eWoY"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 4671,
    "path": "../public/assets/alert-dialog-CEgO3Qis.js"
  },
  "/assets/api-BMfG1JdZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"945-Q8Dg9DLVAMXU3JccgoMjn1fjmcA"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 2373,
    "path": "../public/assets/api-BMfG1JdZ.js"
  },
  "/assets/api-D29FXY8r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"178-ew+/Uf8nFUb4x9BEg+KHgoEhJ0w"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 376,
    "path": "../public/assets/api-D29FXY8r.js"
  },
  "/assets/api-DlWjBAJt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cbb-sQFf5vzuwRjlrHMFtIhWWjhx8OE"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 3259,
    "path": "../public/assets/api-DlWjBAJt.js"
  },
  "/assets/api-DvZR6hpa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"449-+Z3WgYNaDgN5V/1hF5Me2VXY6mQ"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 1097,
    "path": "../public/assets/api-DvZR6hpa.js"
  },
  "/assets/approvals-DoB5mU0o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2aa2-xFIupMmuTnDeF5LMmAgh7eDuyCw"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 10914,
    "path": "../public/assets/approvals-DoB5mU0o.js"
  },
  "/assets/area-C9m7P8Y4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"21f-N1uoea9H/+DPkUbtihESFuwj6yY"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 543,
    "path": "../public/assets/area-C9m7P8Y4.js"
  },
  "/assets/arrow-right-Ca6lBW5x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a6-9dsQC+HyR8+3hBnD7pOxITJo1Gg"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 166,
    "path": "../public/assets/arrow-right-Ca6lBW5x.js"
  },
  "/assets/archive-sGeCVN-D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fe-9pKfhf8Qqu9I0fzoV42DO645Uy8"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 254,
    "path": "../public/assets/archive-sGeCVN-D.js"
  },
  "/assets/arrow-right-left-Q1M8UBz5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f9-dt4Mke49y/qk72b6mhOylQoRs9s"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 249,
    "path": "../public/assets/arrow-right-left-Q1M8UBz5.js"
  },
  "/assets/assistant.functions-BtDMVEeZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"496-KYXeN1Sdw0iBCL+LJLOWenAdLwY"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 1174,
    "path": "../public/assets/assistant.functions-BtDMVEeZ.js"
  },
  "/assets/attendance-CKA5duwE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"50ce-lKk/qP6IyKao17o0Iuw7nrm9uNc"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 20686,
    "path": "../public/assets/attendance-CKA5duwE.js"
  },
  "/assets/biz.3k-area-BVeADhJr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42a-9pOuONg31uThEGyz3sz+TSoZP6o"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 1066,
    "path": "../public/assets/biz.3k-area-BVeADhJr.js"
  },
  "/assets/biz.3k-BUezI2Lf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"391-by7CJ8L4ZapgQX52b816P/NI/pg"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 913,
    "path": "../public/assets/biz.3k-BUezI2Lf.js"
  },
  "/assets/biz.approvals-g6pKTwYM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5bca-cmkF77d4lnKMI1OEPNA3EO/gUjc"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 23498,
    "path": "../public/assets/biz.approvals-g6pKTwYM.js"
  },
  "/assets/biz.goals-DqRi2VrL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91e3-+uLpCfdvjZ0zZgLZX4F82TvzIuw"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 37347,
    "path": "../public/assets/biz.goals-DqRi2VrL.js"
  },
  "/assets/biz.crm-AkDbLJUD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4cf6e-FfgQwsnK5CkT2PjPzTHqGIx3wdQ"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 315246,
    "path": "../public/assets/biz.crm-AkDbLJUD.js"
  },
  "/assets/biz.index-dKgtx41R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e70e-3VXsiqFp8gyzhADMfitEVtJNTwA"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 59150,
    "path": "../public/assets/biz.index-dKgtx41R.js"
  },
  "/assets/biz.products-Bb-o_40J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"25f-CJskBQwmT1RGpUTn7Sf5X1XFt4U"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 607,
    "path": "../public/assets/biz.products-Bb-o_40J.js"
  },
  "/assets/biz.reports-CyQfoxgk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"443d-kdBkI7ECdrXBsY0segeEvInYz78"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 17469,
    "path": "../public/assets/biz.reports-CyQfoxgk.js"
  },
  "/assets/biz.plans-Dna5blip.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"458-UEszJnM4Cb5swefOXte2up1a/S0"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 1112,
    "path": "../public/assets/biz.plans-Dna5blip.js"
  },
  "/assets/biz.sale-work-CmPT4g_G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"30a8-D/AjuO47ob7FK6hhBjKtBrdYhIA"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 12456,
    "path": "../public/assets/biz.sale-work-CmPT4g_G.js"
  },
  "/assets/biz.settings-Zr2qur96.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7be5-6jLXld6oOO3szVY9U/lBCtWxRTk"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 31717,
    "path": "../public/assets/biz.settings-Zr2qur96.js"
  },
  "/assets/brands._id-Q6ERqaB1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5d22-7Augnc3pJsDxWr8/yGtcp59qfjk"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 23842,
    "path": "../public/assets/brands._id-Q6ERqaB1.js"
  },
  "/assets/brands.index-BciKyhia.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1cdd-bmA3id9Fguuaz+d7aCGbDRrUFz4"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 7389,
    "path": "../public/assets/brands.index-BciKyhia.js"
  },
  "/assets/calendar-CVHXtM9Q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"102-JQoiJ8QRxkvH7hllix+LnTSnh2Q"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 258,
    "path": "../public/assets/calendar-CVHXtM9Q.js"
  },
  "/assets/brands._id-DhX46j8o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"af-w3JUy0WSpiGQjjChHRF0fxWI7og"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 175,
    "path": "../public/assets/brands._id-DhX46j8o.js"
  },
  "/assets/calendar-clock-DXrMyrSC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17b-3oR0aCkX78cPZ4w2sINuZxt04ok"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 379,
    "path": "../public/assets/calendar-clock-DXrMyrSC.js"
  },
  "/assets/chart-Be86ie6m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"115d-rs6/+7nTPMoYpTMB8zLc5HdWA4A"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 4445,
    "path": "../public/assets/chart-Be86ie6m.js"
  },
  "/assets/chevron-left-Dl5XBAbS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"83-YPiuvSYjenBg101lMwqCQAmIc+w"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 131,
    "path": "../public/assets/chevron-left-Dl5XBAbS.js"
  },
  "/assets/chevron-up-CuWBL8Ph.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"81-OjQpQX9cRXcV5UYfkP0xjDbzRZ8"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 129,
    "path": "../public/assets/chevron-up-CuWBL8Ph.js"
  },
  "/assets/chinh-sach-bao-mat-BwyT7UtR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11cd-B/SUpWsbsHuCpUkXfTQvx5sl6kw"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 4557,
    "path": "../public/assets/chinh-sach-bao-mat-BwyT7UtR.js"
  },
  "/assets/circle-alert-Civ31_7S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fb-Huef0lVf6zyKYD09H4Ry+hDDb/U"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 251,
    "path": "../public/assets/circle-alert-Civ31_7S.js"
  },
  "/assets/circle-check-T8IRjaiI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b3-c2H6ynUqYGU3mgDFFZOLKXd3Y+E"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 179,
    "path": "../public/assets/circle-check-T8IRjaiI.js"
  },
  "/assets/clock-CpkWYhQG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"aa-/McX+UkZuRba2DYbdFInAECGNvY"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 170,
    "path": "../public/assets/clock-CpkWYhQG.js"
  },
  "/assets/clock-3-B0nbjur4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"aa-QQzYRwW6DuGA3Ta484Ndr0IyFco"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 170,
    "path": "../public/assets/clock-3-B0nbjur4.js"
  },
  "/assets/command-L2nMJwSr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3756-axSbgigijipJWtinKeTUMDf0Bl4"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 14166,
    "path": "../public/assets/command-L2nMJwSr.js"
  },
  "/assets/community-DjX62rbm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b4f-2CWKrUgWCWRmd7V/YxOvEEg3yCg"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 2895,
    "path": "../public/assets/community-DjX62rbm.js"
  },
  "/assets/copy-CsaYhR-J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ed-KQllu3LxxQ1ctJ+IKCwHaouTwrA"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 237,
    "path": "../public/assets/copy-CsaYhR-J.js"
  },
  "/assets/deadline-CNPW_3Cu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bb4-yMPmM621iNUvylV2RA/1NEa1ibg"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 2996,
    "path": "../public/assets/deadline-CNPW_3Cu.js"
  },
  "/assets/deep-link-Cip1Q8Ki.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14b-KMM6nhWPx5ijG/CVyRki4IgX0f0"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 331,
    "path": "../public/assets/deep-link-Cip1Q8Ki.js"
  },
  "/assets/database-B6m2pGSM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f4-yinPz/+3EOA5AcANeWRIA1a/vAk"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 244,
    "path": "../public/assets/database-B6m2pGSM.js"
  },
  "/assets/design.marketing-B59mBLGM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"47a-YrXhA9BRJ5UiewCLWlLTf1Xx238"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 1146,
    "path": "../public/assets/design.marketing-B59mBLGM.js"
  },
  "/assets/design-CSyAtAzQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b10-jJd9J8Cw5EpXBSJVkOFNLg+GvR4"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 2832,
    "path": "../public/assets/design-CSyAtAzQ.js"
  },
  "/assets/design.mockups-CY4Ydp2w.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"476-ixaATo2KMXXvyEn17inc4hA4CoM"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 1142,
    "path": "../public/assets/design.mockups-CY4Ydp2w.js"
  },
  "/assets/design.photo-BSMxwVjR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46f-BQ9yEUmu8TVzKzb+w7R0zJ5JzB4"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 1135,
    "path": "../public/assets/design.photo-BSMxwVjR.js"
  },
  "/assets/design.reports-DkOOY3K9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"470-IvEPJ3SLbAsYCkZdDAVINfmNBPM"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 1136,
    "path": "../public/assets/design.reports-DkOOY3K9.js"
  },
  "/assets/distribution.3k--kw8vA3C.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"440-dcgx+Vn5LPlXcVy5MeIJlfs16T8"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 1088,
    "path": "../public/assets/distribution.3k--kw8vA3C.js"
  },
  "/assets/documentQueries-BVArbPFr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d3e-YWPbvV6bytgm5R7OJIm3nMhshaA"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 3390,
    "path": "../public/assets/documentQueries-BVArbPFr.js"
  },
  "/assets/documents-D653ogvf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13de-ia/BJDVfDp7tfeGsG5GUTbtOhrI"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 5086,
    "path": "../public/assets/documents-D653ogvf.js"
  },
  "/assets/ellipsis-jI2eIaD2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e3-9mTPT6PiMPqSKiVVuw5fWluMliU"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 227,
    "path": "../public/assets/ellipsis-jI2eIaD2.js"
  },
  "/assets/external-link-B9V8WBl9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fc-7ilRItIEG2LDVoVWGpoHj/xaTkk"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 252,
    "path": "../public/assets/external-link-B9V8WBl9.js"
  },
  "/assets/file-check-corner-BaAR3MH3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13c-kqAji4HTEqvrA+q/iINCgEIjV3E"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 316,
    "path": "../public/assets/file-check-corner-BaAR3MH3.js"
  },
  "/assets/file-plus-corner-BzTxB5mC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"15e-MOVX4wOlthrnIQ8cyM0Q90ffTJo"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 350,
    "path": "../public/assets/file-plus-corner-BzTxB5mC.js"
  },
  "/assets/finance.advance-BgydhUkD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ca-K6+k5CXmGWoBYegNacWTg/5IwoA"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 458,
    "path": "../public/assets/finance.advance-BgydhUkD.js"
  },
  "/assets/finance.incoming._id-vmCwwo61.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"348c-aaR8UK2Lch/hukzZolkE0bsYDno"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 13452,
    "path": "../public/assets/finance.incoming._id-vmCwwo61.js"
  },
  "/assets/download-CHg9eNTU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e9-kxtYeUoKgrj/3zFOw84GxgmITGg"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 233,
    "path": "../public/assets/download-CHg9eNTU.js"
  },
  "/assets/finance.payment-C3KJkbJB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ca-6ZSanFGtQwQyPYrjPgPvZo2r2ms"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 458,
    "path": "../public/assets/finance.payment-C3KJkbJB.js"
  },
  "/assets/finance.incoming.index-Sqo4UUqc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"827c-Siw6Qr6zUo3SVEloyXuA4SCV9m4"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 33404,
    "path": "../public/assets/finance.incoming.index-Sqo4UUqc.js"
  },
  "/assets/finance.salary-Bt1oe4tQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1d1-O4/EAVORMyi04YpibA5SEn8F2t4"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 465,
    "path": "../public/assets/finance.salary-Bt1oe4tQ.js"
  },
  "/assets/goals-Cxc9Pzof.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"76e-B9chPDXvfYrfY8R97k++oIqmGvY"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 1902,
    "path": "../public/assets/goals-Cxc9Pzof.js"
  },
  "/assets/goals-v2-BN1hYddJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"18d-+J1wirFe2OXVH8L3jp0mp+J3CcY"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 397,
    "path": "../public/assets/goals-v2-BN1hYddJ.js"
  },
  "/assets/image-CvLnIS41.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10e-PGj/figUYsIeDw9XlNHWHgOXwl0"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 270,
    "path": "../public/assets/image-CvLnIS41.js"
  },
  "/assets/history-BkAYTCdk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ee-wD9ngfLB7fWIQ07VfxIBsQ0Qrnw"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 238,
    "path": "../public/assets/history-BkAYTCdk.js"
  },
  "/assets/hooks-DiE3xEnn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"135-zIoglBsmPGblGELRi2vnborFtvQ"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 309,
    "path": "../public/assets/hooks-DiE3xEnn.js"
  },
  "/assets/image-plus-3BbrpOKB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"16c-G42OutcYiwufxk5e4M4DAVKDsJ4"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 364,
    "path": "../public/assets/image-plus-3BbrpOKB.js"
  },
  "/assets/inbox-BzGuWyAz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f-QgqJWstda9D6fugUqr2Gh8G38fM"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 287,
    "path": "../public/assets/inbox-BzGuWyAz.js"
  },
  "/assets/inbox-CyaK2OMU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6058-N/EhE8w1hT9p62Nm6b7/8m6y6Xg"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 24664,
    "path": "../public/assets/inbox-CyaK2OMU.js"
  },
  "/assets/index-1TVH625p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"37da-vK49NQnpwLhryKdJ3sd7NO2WyGo"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 14298,
    "path": "../public/assets/index-1TVH625p.js"
  },
  "/assets/index-B9qi4YKO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"87d-bnY8iLqUrTgYuQkBzyoKSSPDypQ"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 2173,
    "path": "../public/assets/index-B9qi4YKO.js"
  },
  "/assets/info-DQ9Sban0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cd-zrp5VR1ZQiCZPyqzf2FeGDzRRTQ"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 205,
    "path": "../public/assets/info-DQ9Sban0.js"
  },
  "/assets/k3-center-CYK7byLM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"437-r/b/Y4wxDlJ1W6Cjn3LE9Yx/L4g"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 1079,
    "path": "../public/assets/k3-center-CYK7byLM.js"
  },
  "/assets/k3_.unit._unit-B4o7pfkY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"453-Jb9wieB+AT9MmSWm0jPqYlBr9Hw"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 1107,
    "path": "../public/assets/k3_.unit._unit-B4o7pfkY.js"
  },
  "/assets/key-round-S8O7VJTG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"164-otXNaegr6UImWL8WKl2zGV4Cl7g"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 356,
    "path": "../public/assets/key-round-S8O7VJTG.js"
  },
  "/assets/leave-vPGT1zWN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8356-F6hBmvHW94PbR3fNTlvMvCd5/L0"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 33622,
    "path": "../public/assets/leave-vPGT1zWN.js"
  },
  "/assets/link-2-DzUX7FgX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f3-AGmeAEOdRKmLLA3YD6GLFgQreUI"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 243,
    "path": "../public/assets/link-2-DzUX7FgX.js"
  },
  "/assets/link-Jb9sqauG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"101-Gx4MvoTKgB0dbNIGMVKXXNGljwk"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 257,
    "path": "../public/assets/link-Jb9sqauG.js"
  },
  "/assets/loader-circle-gG8LH9Ff.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91-6YgO/6XSDXhGlGjjMqa3jqrQO1Y"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 145,
    "path": "../public/assets/loader-circle-gG8LH9Ff.js"
  },
  "/assets/local._id-MGlmy6Hf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2aee-eCmpxj+ZhelpxbfkJR0AZdYwOrQ"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 10990,
    "path": "../public/assets/local._id-MGlmy6Hf.js"
  },
  "/assets/local.index-CG-CA3of.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"18cb-ilWKr1hJUGwjBE/umdrFz0JvYSk"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 6347,
    "path": "../public/assets/local.index-CG-CA3of.js"
  },
  "/assets/lock-Ds9ER7oX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cf-6BBxwOnRuFFXSEoTEqaM5YPZFEM"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 207,
    "path": "../public/assets/lock-Ds9ER7oX.js"
  },
  "/assets/lock-keyhole-CNUqP4tr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"100-eqA7LUK1oXBYGR21pkLphks8BQo"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 256,
    "path": "../public/assets/lock-keyhole-CNUqP4tr.js"
  },
  "/assets/logic-CRLOGxw8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c01-xyhvppXbcjB9+GVWIlhiYWJhSSM"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 3073,
    "path": "../public/assets/logic-CRLOGxw8.js"
  },
  "/assets/logic-CYCMg7M_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ca6-/hbHo27qSqc4OCGLrjJwftkpgHw"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 3238,
    "path": "../public/assets/logic-CYCMg7M_.js"
  },
  "/assets/logic-DxHNv_sm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2846-5+y7BYewKb7EHdkVbzLhHFMiinY"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 10310,
    "path": "../public/assets/logic-DxHNv_sm.js"
  },
  "/assets/login-BHe3Kqmj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1cf4-xiEp8o6tVsb/9a/FIH0mrPIo+gI"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 7412,
    "path": "../public/assets/login-BHe3Kqmj.js"
  },
  "/assets/marketingSpecialties-CmE9xKNy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"26d-bmVKtFj66ymSKxjYGqXjW9ZpD+M"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 621,
    "path": "../public/assets/marketingSpecialties-CmE9xKNy.js"
  },
  "/assets/message-circle-Dym201Na.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"52b-mT7xeaJR0ubWSVIOIyEWswDYtX4"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 1323,
    "path": "../public/assets/message-circle-Dym201Na.js"
  },
  "/assets/minus-C8fEG5T_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"76-hWZ8JqsMpZIuCS/lA+hjheaHlI4"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 118,
    "path": "../public/assets/minus-C8fEG5T_.js"
  },
  "/assets/model-DITT3R7P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"810-c/9bX6G0ogpaCeCOb6Ehqa9jRMU"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 2064,
    "path": "../public/assets/model-DITT3R7P.js"
  },
  "/assets/network-CpY6QPKF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"181-auQb1FGseauZYp1Pcf07JgLYYng"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 385,
    "path": "../public/assets/network-CpY6QPKF.js"
  },
  "/assets/index-F5_qjrtn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"109c74-jvr4b9gom3MnSuB3sOy3ufoBhYo"',
    "mtime": "2026-11-21T06:26:23.737Z",
    "size": 1088628,
    "path": "../public/assets/index-F5_qjrtn.js"
  },
  "/assets/okrs-DzmRw6X-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e3-FrO4kVBWwMf9X4inxg0iKyjl/LQ"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 483,
    "path": "../public/assets/okrs-DzmRw6X-.js"
  },
  "/assets/operations_.3k-BlqHV5Qk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"446-fWuw7EpJgllvP2amto5Q34A/6cw"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 1094,
    "path": "../public/assets/operations_.3k-BlqHV5Qk.js"
  },
  "/assets/operations_.3k-accounting-BFuZdztj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"445-qj3gnB1B2aaUh9bRbmCHSTY4xpk"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 1093,
    "path": "../public/assets/operations_.3k-accounting-BFuZdztj.js"
  },
  "/assets/operations_.3k-hr-CK9CpPdI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"454-lOZchWeccJpeoRGhLweTB8B4eI0"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 1108,
    "path": "../public/assets/operations_.3k-hr-CK9CpPdI.js"
  },
  "/assets/order-quotes._id-Bzrt0skk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6f08-YUrTfMUnFuE9YcsWRJmvI8sox7w"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 28424,
    "path": "../public/assets/order-quotes._id-Bzrt0skk.js"
  },
  "/assets/order-quotes.index-FtL65lhO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4a71-vUWeRrRz3eaSZC/lJpe3Ot4fOd0"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 19057,
    "path": "../public/assets/order-quotes.index-FtL65lhO.js"
  },
  "/assets/order-quotes.new-DMK_cW-J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"63b5-HNe+sZEZAhsyEChxDcoxRN3xWMg"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 25525,
    "path": "../public/assets/order-quotes.new-DMK_cW-J.js"
  },
  "/assets/order-quotes.report-B9hikErY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8e20-C3oTuoDQ6u87z1g9QSwtLm4c2dQ"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 36384,
    "path": "../public/assets/order-quotes.report-B9hikErY.js"
  },
  "/assets/order-tracking._id-BVT91yVU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"75fa-i6/rnBt3rEOEAmw38P06Sam9YvI"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 30202,
    "path": "../public/assets/order-tracking._id-BVT91yVU.js"
  },
  "/assets/order-tracking.index-BrGJwE_z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"531d-Kpiq8OY5pnWKEgrplBTSnifBgxs"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 21277,
    "path": "../public/assets/order-tracking.index-BrGJwE_z.js"
  },
  "/assets/organization-B1zv3K_V.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"662-mXn/h6NM5wAp7RSWP4t7isqsRgY"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 1634,
    "path": "../public/assets/organization-B1zv3K_V.js"
  },
  "/assets/orders-BwIle_vF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ce-eDJyGxy6EjHMPUtLeNGjTWHaRkw"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 1230,
    "path": "../public/assets/orders-BwIle_vF.js"
  },
  "/assets/organization-DbAmrU-0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a46e-hUWGHsrbgg7GiI3Kk2TQvblTdPk"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 42094,
    "path": "../public/assets/organization-DbAmrU-0.js"
  },
  "/assets/overview-v2-B4d3fI8c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1c2-nh2b/yVUFtkOjq/kwb/0r7BgP2w"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 450,
    "path": "../public/assets/overview-v2-B4d3fI8c.js"
  },
  "/assets/paperclip-BE2MP7zr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ea-xbRXWL/OloYNdE16ZALNNar8mUo"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 234,
    "path": "../public/assets/paperclip-BE2MP7zr.js"
  },
  "/assets/pencil-DCqNzs3M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"115-qA4Twp+ym+nEJiDuLvDUXzNRiHE"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 277,
    "path": "../public/assets/pencil-DCqNzs3M.js"
  },
  "/assets/pencil-line-vUUI6N-Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13f-SO50KBBYOzsbeLKkRRyYvxyETPs"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 319,
    "path": "../public/assets/pencil-line-vUUI6N-Y.js"
  },
  "/assets/pending-B1L8Y4wE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"94e-NXHA6jrJ55SO5+6zii2DdmXPz0M"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 2382,
    "path": "../public/assets/pending-B1L8Y4wE.js"
  },
  "/assets/percent-5jfWXM02.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f3-/wMHIb3ddFytBUh9VSlqByzuuns"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 243,
    "path": "../public/assets/percent-5jfWXM02.js"
  },
  "/assets/phone-DvMzzN8Q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"143-l2YZMpdGmyrGWwEPBmiq6lH6BK8"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 323,
    "path": "../public/assets/phone-DvMzzN8Q.js"
  },
  "/assets/play-BWKx55p9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bf-5+aM3DYOGvX4md264GJ7F7TEzjM"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 191,
    "path": "../public/assets/play-BWKx55p9.js"
  },
  "/assets/plus-Ceh70U_b.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9a-TrNyTAwJHypoSHiBqnvAsf8P7/A"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 154,
    "path": "../public/assets/plus-Ceh70U_b.js"
  },
  "/assets/procurement_.suppliers-Mz4K-84s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8536-0kQp+3Cg1gd8Qa0pQMwy8cq/qto"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 34102,
    "path": "../public/assets/procurement_.suppliers-Mz4K-84s.js"
  },
  "/assets/profile-CZ5WGqyU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a46-DcwQenEagtuQmbGu/3CuHS7VI9U"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 10822,
    "path": "../public/assets/profile-CZ5WGqyU.js"
  },
  "/assets/queries-CA88g4mh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a03-AP29XmNBY5VwyUAx60Z49w0zE8g"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 2563,
    "path": "../public/assets/queries-CA88g4mh.js"
  },
  "/assets/refresh-cw-Bkp9TPhx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"142-NtRBI/EvvoZRm8OozeoADC7d7m8"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 322,
    "path": "../public/assets/refresh-cw-Bkp9TPhx.js"
  },
  "/assets/register-DgVHYC5Q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11a2-YEi7ZD7lxOS+n0mMyiK3ObwE3zk"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 4514,
    "path": "../public/assets/register-DgVHYC5Q.js"
  },
  "/assets/reports-v2-twt-3SO4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"395-dc5C5qUwgbnOjZbgY0TnKAUNlWw"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 917,
    "path": "../public/assets/reports-v2-twt-3SO4.js"
  },
  "/assets/reset-password-5VLZxq6P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f95-kpPAYSOOr2xfFBQAdWeVzld9TEg"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 3989,
    "path": "../public/assets/reset-password-5VLZxq6P.js"
  },
  "/assets/rollingQueries-DLQ3kizm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9ec-H6RSJNBfE3qXfdKhOpCECdYBJdo"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 2540,
    "path": "../public/assets/rollingQueries-DLQ3kizm.js"
  },
  "/assets/rotate-ccw-DuXk_Trt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c9-OqWGWAtRZnkUKgzwaAUnocxie2w"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 201,
    "path": "../public/assets/rotate-ccw-DuXk_Trt.js"
  },
  "/assets/sao.admin-C9M7HSXo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b9-8X6JMzrowSM1gmmYovdAdRTV144"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 441,
    "path": "../public/assets/sao.admin-C9M7HSXo.js"
  },
  "/assets/rotate-cw-iCeP8hlk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ca-8hw7tS1sxJQMmd6A6Gt6FYgNEc8"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 202,
    "path": "../public/assets/rotate-cw-iCeP8hlk.js"
  },
  "/assets/sao.index-bp6PoABv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ba-PMVJ8EjfH+t9jUWm+5fiCXCNIcQ"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 442,
    "path": "../public/assets/sao.index-bp6PoABv.js"
  },
  "/assets/sao.earn-CftM1ltM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b8-Ifp2p9+Tmkb3bDGjSAHJ3YJoIjs"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 440,
    "path": "../public/assets/sao.earn-CftM1ltM.js"
  },
  "/assets/sao.leaderboard-DvcuhXV8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1afc-78QN4iHYo9kXPfe8rph7cqHTauk"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 6908,
    "path": "../public/assets/sao.leaderboard-DvcuhXV8.js"
  },
  "/assets/select-RMGXHFfH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"56b7-bWYVwFSTyiclCEv5QJQKJJz9rRg"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 22199,
    "path": "../public/assets/select-RMGXHFfH.js"
  },
  "/assets/sao.shop-o7GzRSnI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b8-D3Pp8QWq1Qypo+f1tMG/qv1f+vs"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 440,
    "path": "../public/assets/sao.shop-o7GzRSnI.js"
  },
  "/assets/send-k_Mc5aa2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"123-H7xUuzpQIHkKd2cBUfY4ufB1EGw"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 291,
    "path": "../public/assets/send-k_Mc5aa2.js"
  },
  "/assets/settings-2-DELRr39u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fd-1H/D4ouOT1+QcFBAAka6ASeUga8"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 253,
    "path": "../public/assets/settings-2-DELRr39u.js"
  },
  "/assets/settings-B9K_kU1H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ca43-Do3t7OqBd96TSr01nr2wIKMBp5k"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 51779,
    "path": "../public/assets/settings-B9K_kU1H.js"
  },
  "/assets/settings_.kpi-v2-BH2zfBQV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1d3-f/Xwxcag4/PHV5R1qjV8m3msUAE"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 467,
    "path": "../public/assets/settings_.kpi-v2-BH2zfBQV.js"
  },
  "/assets/shield-alert-C9l6ZxIS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"162-HHHwPYXG/ry6jdPKp3Kjky8fHaU"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 354,
    "path": "../public/assets/shield-alert-C9l6ZxIS.js"
  },
  "/assets/shield-check-mmXHT1OF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"141-oB1ksHEVKo5sR53MGPLMNfJaDsk"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 321,
    "path": "../public/assets/shield-check-mmXHT1OF.js"
  },
  "/assets/showroom-D6e366w0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"183a-mNTj3y4zJfyIAHkq0Km7SbQJ7ys"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 6202,
    "path": "../public/assets/showroom-D6e366w0.js"
  },
  "/assets/showroom_.3k-C27EC1vr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"42d-C1vQJycoTfEKJoDXkNsnnU+blP4"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 1069,
    "path": "../public/assets/showroom_.3k-C27EC1vr.js"
  },
  "/assets/showroom_.shifts-Cqsb8w4p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7b07-/nJf1fZf7nFCgtjFguLhsU32jfs"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 31495,
    "path": "../public/assets/showroom_.shifts-Cqsb8w4p.js"
  },
  "/assets/showroom_.suppliers-DtqBFgK5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29-crG9x4dYeQi7xsfEfaRvCOejUcg"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 41,
    "path": "../public/assets/showroom_.suppliers-DtqBFgK5.js"
  },
  "/assets/signal-j5Q-M7H2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10d-ynK4pCHvTArLneXMvq3PEMwxvhM"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 269,
    "path": "../public/assets/signal-j5Q-M7H2.js"
  },
  "/assets/signals.index-zzn4nwLx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"359-39rEVdtWjzVDS4V73y0LfbN1T4s"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 857,
    "path": "../public/assets/signals.index-zzn4nwLx.js"
  },
  "/assets/skeleton-0BiAar6p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b1-MbN/xDjempYrhgs8mCBBGkUDNGM"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 177,
    "path": "../public/assets/skeleton-0BiAar6p.js"
  },
  "/assets/signals.report-BuwGbFnH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"dc8e-zcmZefh5tok3YVQ9yimZhUmdetI"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 56462,
    "path": "../public/assets/signals.report-BuwGbFnH.js"
  },
  "/assets/social._id-BOm46J6t.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"52ca-7xS6oidfdvarzFQZIazaLpvdqQk"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 21194,
    "path": "../public/assets/social._id-BOm46J6t.js"
  },
  "/assets/states-D4afSZ3f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"196c-V9/VQglvB2uYaw/p2c4lTYhUnhY"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 6508,
    "path": "../public/assets/states-D4afSZ3f.js"
  },
  "/assets/social.index-gSxA_19W.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ec-kOW/2otvs4SVQtqwezwPoY7wXpY"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 9452,
    "path": "../public/assets/social.index-gSxA_19W.js"
  },
  "/assets/table-BlEXjVfV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"101-CmlcnCigbbUO1TIDwloZ3kOo2zA"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 257,
    "path": "../public/assets/table-BlEXjVfV.js"
  },
  "/assets/table-Dl8mzPcs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"62c-Z87ca9/oKofY72/afXGJwrv1W3o"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 1580,
    "path": "../public/assets/table-Dl8mzPcs.js"
  },
  "/assets/tabs-BikClquI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ca1-TQ/W4nyESwfGikm6xT0Jr/SwJIU"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 3233,
    "path": "../public/assets/tabs-BikClquI.js"
  },
  "/assets/styles-aNeg4tiP.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"32bef-Ocl/XrJXzdTtdhPII9rXOOikN/0"',
    "mtime": "2026-11-21T06:26:23.712Z",
    "size": 207855,
    "path": "../public/assets/styles-aNeg4tiP.css"
  },
  "/assets/tasks-tDjCRjGj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6c2e-twarA7oTwEGj0jm26J9TxYo8DsM"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 27694,
    "path": "../public/assets/tasks-tDjCRjGj.js"
  },
  "/assets/textarea-AWWGDCCI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1c7-xhVp2wtwyMFApjxOg0dgOmp50y0"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 455,
    "path": "../public/assets/textarea-AWWGDCCI.js"
  },
  "/assets/timeframe-BFZYz9dl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"751-bujw4AkMr5t8SJTh4LvdP+DUAds"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 1873,
    "path": "../public/assets/timeframe-BFZYz9dl.js"
  },
  "/assets/timer-i0Ugd0Jl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ef-ppji75J+lzUInQJhbTYBQwIauxU"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 239,
    "path": "../public/assets/timer-i0Ugd0Jl.js"
  },
  "/assets/trash-2-BxhKeD48.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"149-bqHM0O8vsW4Ridhx/8ImweX7c1I"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 329,
    "path": "../public/assets/trash-2-BxhKeD48.js"
  },
  "/assets/trending-up-tp7mJx8Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b0-Ifrqir5wZLg05zzzASSCPIOtUKw"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 176,
    "path": "../public/assets/trending-up-tp7mJx8Z.js"
  },
  "/assets/triangle-alert-vB1LdCmr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10a-wyeDzXXgszaD1TMIEkNQg/oYhv0"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 266,
    "path": "../public/assets/triangle-alert-vB1LdCmr.js"
  },
  "/assets/types-D7FysIDo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cefc-cTqwq67EB0tsjXpoTn+q0+xDJ0I"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 52988,
    "path": "../public/assets/types-D7FysIDo.js"
  },
  "/assets/undo-2-CYK3TuvC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d1-DIaoe0f0GJKhioOiiFmyopFIN2M"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 209,
    "path": "../public/assets/undo-2-CYK3TuvC.js"
  },
  "/assets/useRecordContext-C3_fcg8Q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1c2-m7EOOvToiUoVvQxOZcU5wHjmx9s"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 450,
    "path": "../public/assets/useRecordContext-C3_fcg8Q.js"
  },
  "/assets/user-plus-Buo7R4m0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"137-xtTDAY62/rL72W/WusALbbIiWuM"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 311,
    "path": "../public/assets/user-plus-Buo7R4m0.js"
  },
  "/assets/user-round-BL3WiWRQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b7-rRrfsbAGsEoJRp0fnYrdVuCspSs"',
    "mtime": "2026-11-21T06:26:23.735Z",
    "size": 183,
    "path": "../public/assets/user-round-BL3WiWRQ.js"
  },
  "/assets/videos-Cdd3YZQH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7e73-idu6KGD1uVoPVzSg25MEwi86AuU"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 32371,
    "path": "../public/assets/videos-Cdd3YZQH.js"
  },
  "/assets/web-chat-D8A3pxOz.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"492f-faJsiAMfrekp8X/DaUU2jH/LXMM"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 18735,
    "path": "../public/assets/web-chat-D8A3pxOz.css"
  },
  "/assets/web-chat-DWTSsIMm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"59ef-FJErgkMfQ6diN02ZAVF/7npL9E0"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 23023,
    "path": "../public/assets/web-chat-DWTSsIMm.js"
  },
  "/assets/web-contents-CEMSj7Ap.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3d51-y8ZC2PCdjMkqUAbBYReDRuivXP0"',
    "mtime": "2026-11-21T06:26:23.734Z",
    "size": 15697,
    "path": "../public/assets/web-contents-CEMSj7Ap.js"
  },
  "/assets/websites.index-DOCujd0x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2ec0-d028dEGGVkaM9I+hSSsvKytJ4pQ"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 11968,
    "path": "../public/assets/websites.index-DOCujd0x.js"
  },
  "/assets/websites._id-sQpigSfH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2374e-APoYzoXRk4tSiHRqw9lizqDWezc"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 145230,
    "path": "../public/assets/websites._id-sQpigSfH.js"
  },
  "/assets/xlsx-CNerDvZX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"68c87-iYcdqLSg6nl18J6BABJp3meqVNI"',
    "mtime": "2026-11-21T06:26:23.736Z",
    "size": 429191,
    "path": "../public/assets/xlsx-CNerDvZX.js"
  }
};
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
  gzip: ".gz",
  br: ".br",
  zstd: ".zst"
};
const _gYNiep = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) {
    return;
  }
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
  let asset;
  const encodingHeader = event.req.headers.get("accept-encoding") || "";
  const encodings = [...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete("Cache-Control");
      throw new HTTPError({ status: 404 });
    }
    return;
  }
  if (encodings.length > 1) {
    event.res.headers.append("Vary", "Accept-Encoding");
  }
  const ifNotMatch = event.req.headers.get("if-none-match") === asset.etag;
  if (ifNotMatch) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  const ifModifiedSinceH = event.req.headers.get("if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  if (asset.type) {
    event.res.headers.set("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.headers.has("ETag")) {
    event.res.headers.set("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.headers.has("Last-Modified")) {
    event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.res.headers.has("Content-Encoding")) {
    event.res.headers.set("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.res.headers.has("Content-Length")) {
    event.res.headers.set("Content-Length", asset.size.toString());
  }
  return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_PdQ8Z9 = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_PdQ8Z9 };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_gYNiep)
].filter(Boolean);
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~middleware"].push(...globalMiddleware);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) {
      middleware.push(...routeRules.routeRuleMiddleware);
    }
    middleware.push(...h3App["~middleware"]);
    if (route?.data?.middleware?.length) {
      middleware.push(...route.data.middleware);
    }
    return middleware;
  };
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
  process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
  process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
const tracingSrvxPlugins = [];
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
  port,
  hostname: host,
  tls: cert && key ? {
    cert,
    key
  } : void 0,
  fetch: nitroApp.fetch,
  plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
const nodeServer = {};
export {
  nodeServer as default
};
