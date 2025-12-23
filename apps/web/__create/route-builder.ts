import { Hono } from "hono";
import type { Handler } from "hono/types";
import updatedFetch from "../src/__create/fetch";

const API_BASENAME = "/api";
const api = new Hono();

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Use import.meta.glob to load all route.js files at build time
// compatible with both Dev (eager/lazy) and Prod (bundled)
const routeModules = import.meta.glob("../src/app/api/**/route.js", {
  eager: true,
});

// Helper function to transform file path to Hono route path
function getHonoPath(filePath: string): { name: string; pattern: string }[] {
  // filePath is relative to this file, e.g., "../src/app/api/lobby/[code]/route.js"
  // We want to extract "lobby/[code]"
  const parts = filePath.split("/");
  // Find the index of 'api' to start path from there
  const apiIndex = parts.indexOf("api");
  if (apiIndex === -1) return [];

  const routeParts = parts.slice(apiIndex + 1, -1); // content between 'api' and 'route.js'

  if (routeParts.length === 0) {
    return [{ name: "root", pattern: "" }];
  }

  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match; // dots is '...' or undefined
      return dots === "..."
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

function registerRoutes() {
  api.routes = []; // Clear existing (though only runs once usually)

  // Sort routes by length (descending) to ensure specific routes overlap generic ones correctly
  const sortedRoutes = Object.entries(routeModules).sort(
    ([pathA], [pathB]) => pathB.length - pathA.length
  );

  for (const [filePath, module] of sortedRoutes) {
    const route = module as any;
    const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]; // Added OPTIONS

    for (const method of methods) {
      // Check for exported method (e.g. export function POST...)
      // Also check for 'action' and 'loader' for React Router compat if we wanted,
      // but here we are building a raw Hono API, so we stick to method exports or mapped loaders.
      // The previous code checked `route[method]`.
      // Wait, my previous TASK was converting routes to `action`/`loader`.
      // But this `route-builder.ts` explicitly checks for HTTP methods (GET, POST).
      // If I converted `join/route.js` to `export action`, this builder WONT SEE IT.
      // I MUST ADAPT THIS BUILDER to handle `action` (POST/PUT/PATCH/DELETE) and `loader` (GET).

      // Let's check what I did to `join/route.js`. safely.
      // I converted it to `export async function action`.
      // So I need to map `action` to POST (or all mutations?) and `loader` to GET.

      /* 
          Standard React Router mapping:
          loader -> GET
          action -> POST, PUT, PATCH, DELETE
          
          However, usually `action` handles the method inside it via `request.method`.
          So validly, we should register `action` for ALL non-GET methods.
       */

      let handler: Handler | undefined;
      let methodToRegister = method;

      if (route[method]) {
        // Direct method export (e.g. POST) - legacy support or explicit
        handler = async (c) => {
          return route[method](c.req.raw, { params: c.req.param() });
        };
      } else if (method === "GET" && route.loader) {
        // Loader -> GET
        handler = async (c) => {
          return route.loader({ request: c.req.raw, params: c.req.param() });
        };
      } else if (
        ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
        route.action
      ) {
        // Action -> Mutation methods.
        // Hono router needs to register for each.
        // We can just register the same handler.
        handler = async (c) => {
          return route.action({ request: c.req.raw, params: c.req.param() });
        };
      }

      if (handler) {
        const parts = getHonoPath(filePath);
        const honoPath = `/${parts.map(({ pattern }) => pattern).join("/")}`;

        const methodLowercase = method.toLowerCase();
        // @ts-ignore
        if (api[methodLowercase]) {
          // @ts-ignore
          api[methodLowercase](honoPath, handler);
        }
      }
    }
  }
}

registerRoutes();

export { api, API_BASENAME };
