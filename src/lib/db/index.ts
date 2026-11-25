import "server-only";
import type { Repository } from "./repository";
import { memoryRepository } from "./memory";

/**
 * Single switch for the data backend.
 * Today: in-memory dummy data (resets when the server restarts).
 * Later:  DATA_BACKEND=firebase -> return firebaseRepository (see docs/FIREBASE.md)
 */
export const db: Repository = memoryRepository;
