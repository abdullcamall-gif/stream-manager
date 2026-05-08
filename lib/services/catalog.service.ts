import { SYSTEM_CONTRACT_PATH } from "@/lib/contract";
import {
  findActiveServices,
  type ServiceListItem,
} from "@/lib/repositories/service.repository";
import {
  findActivePlans,
  type PlanListItem,
} from "@/lib/repositories/plan.repository";

/**
 * Catalog rules are defined by docs/system.contract.md.
 */
export async function listCatalogServices(): Promise<ServiceListItem[]> {
  void SYSTEM_CONTRACT_PATH;
  return findActiveServices();
}

/**
 * Catalog rules are defined by docs/system.contract.md.
 */
export async function listCatalogPlans(): Promise<PlanListItem[]> {
  void SYSTEM_CONTRACT_PATH;
  return findActivePlans();
}
