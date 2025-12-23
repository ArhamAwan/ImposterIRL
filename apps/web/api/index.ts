import { handle } from "@hono/node-server/vercel";
// @ts-ignore
import { app } from "../build/server/index.js";

export const config = {
  runtime: "nodejs",
};

export default handle(app);
