import type {
  AdminUser, Coupon, Customer, InventoryLog, Order, OrderStatus, Product, Review, StockAlert,
} from "../types";

/**
 * Storage contract. The app ONLY talks to this interface, so swapping the
 * in-memory dummy store for Firebase (Firestore) is a single new file –
 * see docs/FIREBASE.md.
 */
export interface Repository {
  products: {
    list(opts?: { includeInactive?: boolean }): Promise<Product[]>;
    getById(id: string): Promise<Product | null>;
    getBySlug(slug: string): Promise<Product | null>;
    getMany(ids: string[]): Promise<Product[]>;
    create(p: Product): Promise<Product>;
    update(id: string, patch: Partial<Product>): Promise<Product>;
    remove(id: string): Promise<void>;
  };
  reviews: { listFor(productId: string): Promise<Review[]> };
  customers: {
    getById(id: string): Promise<Customer | null>;
    getByEmail(email: string): Promise<Customer | null>;
    create(c: Customer): Promise<Customer>;
    update(id: string, patch: Partial<Customer>): Promise<Customer>;
    list(): Promise<Customer[]>;
  };
  admins: { getByEmail(email: string): Promise<AdminUser | null> };
  orders: {
    create(o: Order): Promise<Order>;
    getById(id: string): Promise<Order | null>;
    getByNumber(n: string): Promise<Order | null>;
    getByIdempotencyKey(k: string): Promise<Order | null>;
    update(id: string, patch: Partial<Order>): Promise<Order>;
    list(opts?: { status?: OrderStatus; customerId?: string; email?: string }): Promise<Order[]>;
  };
  coupons: { get(code: string): Promise<Coupon | null>; list(): Promise<Coupon[]> };
  inventory: { log(entry: InventoryLog): Promise<void>; list(productId?: string): Promise<InventoryLog[]> };
  stockAlerts: { add(a: StockAlert): Promise<void>; list(): Promise<StockAlert[]> };
  /**
   * Run fn exclusively for a key. Firestore equivalent: runTransaction().
   * Used so two shoppers can never buy the last pair at the same time.
   */
  withLock<T>(key: string, fn: () => Promise<T>): Promise<T>;
}
