/**
 * Service layer entrypoint.
 * Add application services here as backend features are implemented.
 * Contract reference: docs/system.contract.md
 */
export { listCatalogServices, listCatalogPlans } from "./catalog.service";
export { createManualOrder, listOrdersByPhone } from "./checkout.service";
export { approveOrder } from "./assignment.service";
export { loginAdmin, authorizeAdmin } from "./admin-auth.service";
export {
  listAdminOrders,
  approveOrderForAdmin,
  rejectOrder,
  listServicesAdmin,
  createServiceAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
  listPlansAdmin,
  createPlanAdmin,
  updatePlanAdmin,
  deletePlanAdmin,
  listAccountsAdmin,
  createAccountAdmin,
  updateAccountAdmin,
  deleteAccountAdmin,
  listAdminsAdmin,
  createAdminAdmin,
  updateAdminAdmin,
  deleteAdminAdmin,
} from "./admin-management.service";
export type {
  CreateOrderRequest,
  CreateOrderResult,
  OrdersByPhoneResult,
} from "./checkout.service";
export type { ApproveOrderResult } from "./assignment.service";
