import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type {
  PromotionPathGet,
  PromotionPathPost,
  PromotionPathUpdate,
} from "@/types/api/setup/promotion-path";

const { promotionPath } = endpoints;

export const getPromotionPathsFn = async () => {
  return getHelper<PromotionPathGet[]>(promotionPath.getAll);
};

export const createPromotionPathFn = async (data: PromotionPathPost) => {
  return postHelper(promotionPath.create, data);
};

export const updatePromotionPathFn = async (update: PromotionPathUpdate) => {
  return updateHelper(promotionPath.update(update.id), update);
};

export const deletePromotionPathFn = async (id: string) => {
  return deleteHelper(promotionPath.delete(id));
};

export const deleteMultiplePromotionPathsFn = async (ids: string[]) => {
  return deleteHelper(promotionPath.deleteMultiple, ids);
};

export function chainPromotionPaths(
  paths: PromotionPathGet[],
): PromotionPathGet[] {
  if (paths.length === 0) return [];

  // 1. Build map: fromAcademicLevelId → path object
  const fromMap = new Map<string, PromotionPathGet>();
  // Also collect all to-level IDs
  const allToIds = new Set<string>();

  for (const p of paths) {
    fromMap.set(p.fromAcademicLevelId, p);
    allToIds.add(p.toAcademicLevelId);
  }

  // 2. Find the head: the one whose "from" never appears in any "to"
  let head: PromotionPathGet | undefined;
  for (const p of paths) {
    if (!allToIds.has(p.fromAcademicLevelId)) {
      head = p;
      break;
    }
  }
  if (!head) {
    throw new Error("Cannot determine start of chain (cycle or missing link).");
  }

  // 3. Walk the chain
  const result: PromotionPathGet[] = [];
  let current: PromotionPathGet | undefined = head;

  while (current) {
    result.push(current);
    // Look up the next path by matching this one's toAcademicLevelId
    current = fromMap.get(current.toAcademicLevelId);
  }

  return result;
}
