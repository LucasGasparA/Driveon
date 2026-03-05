import { UserPayload } from "../../middlewares/authMiddleware";

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}
