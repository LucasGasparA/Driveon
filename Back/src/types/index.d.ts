import type { UserPayload } from "../middlewares/ensureAuth.js";

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}
