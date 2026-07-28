import { useMemo } from "react";
import type { Permission } from "@/config/permissions";
import type { AppMenuItem } from "@/features/admins/data/admin-menu-items";
import { signalRSelectors, useSignalRStore } from "@/store/signalr.store";

const EMPTY_PERMISSIONS: Permission[] = [];

// =============================================================================
// filterMenuByPermissions
// =============================================================================
// Pure function — easy to unit test.
//
// Rules:
//  1. If an item has no `permission` key → always include it.
//  2. If an item has a `permission` key → only include it if the user's
//     permissions array contains that key.
//  3. For submenus: filter children first. If no children survive, drop the
//     parent entirely (a section header with no children is just noise).

export const filterMenuByPermissions = (
  items: AppMenuItem[],
  userPermissions: Permission[],
): AppMenuItem[] => {
  const permissionSet = new Set(userPermissions);

  const filter = (menu: AppMenuItem[]): AppMenuItem[] => {
    const result: AppMenuItem[] = [];

    for (const item of menu) {
      const allowed = !item.permission || permissionSet.has(item.permission);

      if (!allowed) continue;

      if (item.children?.length) {
        const children = filter(item.children);

        if (children.length) {
          result.push({ ...item, children });
        }

        continue;
      }

      result.push(item);
    }

    return result;
  };

  return filter(items);
};

// =============================================================================
// lockMenuOnExpiry
// =============================================================================
// Pure function — disables every item in the tree except ones flagged
// `exemptFromExpiry` (and any submenu that still has an exempt descendant,
// so its icon/row doesn't render disabled while a live child sits inside it).
// Items are never removed here, only marked `disabled` — the menu stays
// visible, just greyed out and unclickable.

export const lockMenuOnExpiry = (
  items: AppMenuItem[],
  isExpired: boolean,
): AppMenuItem[] => {
  if (!isExpired) return items;

  const lock = (menu: AppMenuItem[]): AppMenuItem[] =>
    menu.map((entry) => {
      if (entry.children?.length) {
        const children = lock(entry.children);
        const hasExemptChild = children.some((c) => !c.exemptFromExpiry);

        return {
          ...entry,
          children,
          disabled: entry.exemptFromExpiry ? false : !hasExemptChild,
        };
      }

      return { ...entry, disabled: !entry.exemptFromExpiry };
    });

  return lock(items);
};

// =============================================================================
// useFilteredMenu
// =============================================================================
// React hook wrapping the pure filters above.
// Memoises on permissions + expiry status so the sidebar doesn't re-render
// unless one of those actually changes (e.g. after a token refresh or a
// SignalR expiry-status push).
// =============================================================================
export const useFilteredMenu = (baseMenu: AppMenuItem[]): AppMenuItem[] => {
  const permissions =
    useSignalRStore(signalRSelectors.permissions) ?? EMPTY_PERMISSIONS;

  const isExpired = useSignalRStore((s) => s.expiryStatus?.isExpired) ?? false;

  return useMemo(() => {
    const byPermission = filterMenuByPermissions(baseMenu, permissions);
    return lockMenuOnExpiry(byPermission, isExpired);
    // baseMenu is a module-level constant so it never changes reference;
    // we only truly re-compute when permissions or expiry status change.
  }, [baseMenu, permissions, isExpired]);
};
