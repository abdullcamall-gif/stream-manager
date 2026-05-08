/**
 * Repository layer entrypoint.
 * Add data-access modules here as backend features are implemented.
 * Contract reference: docs/system.contract.md
 */
export { findActiveServices } from "./service.repository";
export { findActivePlans } from "./plan.repository";
export type { ServiceListItem } from "./service.repository";
export type { PlanListItem } from "./plan.repository";
