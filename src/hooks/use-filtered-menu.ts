import { useMemo } from "react";
import { useAuth } from "@/store/auth.store";
import type { Permission } from "@/config/permissions";
import type { AppMenuItem } from "@/features/admins/data/admin-menu-items";

const EMPTY_PERMISSIONS: Permission[] = [];

// =============================================================================
// filterMenuByPermissions
// =============================================================================
// Pure function — no React, easy to unit test.
//
// Rules:
//  1. If an item has no `permission` key → always include it.
//  2. If an item has a `permission` key → only include it if the user's
//     permissions array contains that key.
//  3. For submenus: filter children first. If no children survive, drop the
//     parent entirely (a section header with no children is just noise).
// =============================================================================
// export const filterMenuByPermissions = (
//   items: AppMenuItem[],
//   userPermissions: Permission[],
// ): AppMenuItem[] => {
//   return items.reduce<AppMenuItem[]>((acc, menuItem) => {
//     // Step 1 — check parent permission
//     const parentAllowed =
//       !menuItem.permission || userPermissions.includes(menuItem.permission);

//     if (!parentAllowed) return acc;

//     // Step 2 — if it has children, recurse and filter them too
//     if (menuItem.children && menuItem.children.length > 0) {
//       const filteredChildren = filterMenuByPermissions(
//         menuItem.children,
//         userPermissions,
//       );

//       // Drop the parent if every child was filtered out
//       if (filteredChildren.length === 0) return acc;

//       return [...acc, { ...menuItem, children: filteredChildren }];
//     }

//     // Step 3 — leaf item that passed the permission check
//     return [...acc, menuItem];
//   }, []);
// };

// OPTIMIZED VERSION
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
// useFilteredMenu
// =============================================================================
// React hook wrapping the pure filter above.
// Memoises on the permissions array so the sidebar doesn't re-render unless
// the user's permissions actually change (e.g. after a token refresh).
// =============================================================================
export const useFilteredMenu = (baseMenu: AppMenuItem[]): AppMenuItem[] => {
  // const permissions = useAuth((s) => s.user?.permissions ?? []) as Permission[];
  const permObjecArr = useAuth((s) => s.other.permissions) ?? EMPTY_PERMISSIONS;
  const permissions = useMemo(() => {
    return permObjecArr.map((obj) => obj.permission);
  }, [permObjecArr]);

  return useMemo(
    () => filterMenuByPermissions(baseMenu, permissions),
    // baseMenu is a module-level constant so it never changes reference;
    // we only truly re-compute when permissions change.
    [baseMenu, permissions],
  );
};
