/**
 * Service layer entrypoint.
 * Add application services here as backend features are implemented.
 * Contract reference: docs/system.contract.md
 */
export { listCatalogServices, listCatalogPlans } from "./catalog.service";
export { createManualOrder, listOrdersByPhone } from "./checkout.service";
export { approveOrder } from "./assignment.service";
export type {
  CreateOrderRequest,
  CreateOrderResult,
  OrdersByPhoneResult,
} from "./checkout.service";
export type { ApproveOrderResult } from "./assignment.service";
