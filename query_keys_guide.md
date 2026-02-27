# Scalable React Query Architecture Guide
## Enterprise-Level Query Keys, Mutations, Invalidation & Performance Strategy

---

# 1️⃣ Introduction

This guide explains how to structure TanStack Query (React Query) in a scalable, predictable, and production-grade way.

This architecture focuses on:

- Hierarchical query keys
- Predictable cache invalidation
- Clean mutation structure
- Preventing over-fetching
- Stable parameter handling
- Dependent dropdown chains
- Memoization strategy
- Feature-based organization

---

# 2️⃣ The Core Rule

Always structure query keys like this:

[domain, scope, paramsObject?]

Example:

["education", "sublevels", { eduId, acaId }]

Never do this:

["SUBLEVELS", eduId, acaId]

Why?

- Hard to partially invalidate
- Hard to scale
- Optional params break cache predictability
- Cannot extend safely with filters

---

# 3️⃣ Query Key Factory (Reusable & Scalable)

Create a reusable key factory:

```ts
export const createQueryKeys = <T extends string>(root: T) => ({
  all: [root] as const,

  lists: () => [root, "list"] as const,
  list: <P extends object>(params?: P) =>
    [root, "list", params] as const,

  details: () => [root, "detail"] as const,
  detail: (id: string) =>
    [root, "detail", id] as const,

  custom: <
    S extends string,
    P extends object | undefined = undefined
  >(scope: S, params?: P) =>
    [root, scope, params] as const,
});
```

---

# 4️⃣ Domain-Level Keys (Education Example)

```ts
export const educationKeys = createQueryKeys("education");

export const eduKeys = {
  levels: () => educationKeys.custom("levels"),

  academicLevels: (eduId?: string) =>
    educationKeys.custom("academic-levels", { eduId }),

  sublevels: (params?: {
    eduId?: string;
    acaId?: string;
    acaIds?: string[];
    page?: number;
    search?: string;
  }) =>
    educationKeys.custom("sublevels", params),
};
```

Now all education-related queries are predictable:

["education", "levels"]  
["education", "academic-levels", { eduId }]  
["education", "sublevels", { acaId }]

---

# 5️⃣ How to Use in Queries

## Simple Query

```ts
useQuery({
  queryKey: eduKeys.levels(),
  queryFn: getAllEduLevelsFn,
});
```

## Query With Params

```ts
const eduId = selectedEdu?.value;

useQuery({
  queryKey: eduKeys.academicLevels(eduId),
  queryFn: () => getAcaByEduIdFn(eduId!),
  enabled: !!eduId,
});
```

---

# 6️⃣ Mutation Keys Structure

Mutation keys are optional but recommended for consistency.

```ts
export const educationMutationKeys = {
  create: ["education", "create"],
  update: ["education", "update"],
  delete: ["education", "delete"],
};
```

Use them:

```ts
useMutation({
  mutationKey: educationMutationKeys.create,
  mutationFn: createEduLevelFn,
});
```

---

# 7️⃣ Cache Invalidation Strategy (CRITICAL)

There are 3 levels of invalidation:

### 1️⃣ Domain-Level

Invalidate everything under education:

```ts
queryClient.invalidateQueries({
  queryKey: educationKeys.all,
});
```

### 2️⃣ Scope-Level

Invalidate only sublevels:

```ts
queryClient.invalidateQueries({
  queryKey: ["education", "sublevels"],
});
```

### 3️⃣ Specific Query

Invalidate only one filtered query:

```ts
queryClient.invalidateQueries({
  queryKey: eduKeys.sublevels({ acaId }),
});
```

---

## Golden Rule:

Invalidate the smallest possible scope.

Never invalidate globally unless absolutely necessary.

---

# 8️⃣ Avoid Over-Fetching in Dependent Dropdown Chains

Scenario:

Education → Academic → Sublevels

Problems if done poorly:
- Refetching when ID hasn’t changed
- Fetching when ID is undefined
- Creating new param objects every render

---

## Correct Pattern

```ts
const eduId = selectedEdu?.value;

useQuery({
  queryKey: eduKeys.academicLevels(eduId),
  queryFn: () => getAcaByEduIdFn(eduId!),
  enabled: !!eduId,
});
```

For sublevels:

```ts
const acaId = selectedAca?.value;

useQuery({
  queryKey: eduKeys.sublevels({ acaId }),
  queryFn: () => getSubLevelsByAcaIdFn(acaId!),
  enabled: !!acaId,
});
```

---

## Why This Prevents Over-Fetching

- Query only runs if enabled = true
- Query key only changes if acaId changes
- React Query caches by key
- No re-fetch if key is identical

---

# 9️⃣ Memoizing Params Properly

Important when using objects as params.

Bad:

```ts
queryKey: eduKeys.sublevels({ acaId })
```

Because the object is recreated every render.

Better:

```ts
const sublevelParams = useMemo(
  () => ({ acaId }),
  [acaId]
);

useQuery({
  queryKey: eduKeys.sublevels(sublevelParams),
});
```

Now reference is stable.

---

# 1️⃣0️⃣ Designing for Pagination & Filters

Future-proof pattern:

```ts
eduKeys.sublevels({
  acaId,
  page,
  pageSize,
  search,
  sort,
});
```

Never change key structure later.

Always extend the params object.

---

# 1️⃣1️⃣ Mutation Strategy Best Practices

After create/update/delete:

Option A — Invalidate:

```ts
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: educationKeys.all,
  });
}
```

Option B — Optimistic Update (Advanced):

```ts
onMutate: async (newItem) => {
  await queryClient.cancelQueries({
    queryKey: eduKeys.levels(),
  });

  const previous = queryClient.getQueryData(
    eduKeys.levels()
  );

  queryClient.setQueryData(
    eduKeys.levels(),
    (old: any[]) => [...old, newItem]
  );

  return { previous };
},
onError: (_err, _newItem, context) => {
  queryClient.setQueryData(
    eduKeys.levels(),
    context?.previous
  );
},
```

Optimistic updates remove need for refetching.

---

# 1️⃣2️⃣ Feature-Based Folder Structure

Recommended:

/features
  /education
    education.api.ts
    education.keys.ts
    education.mutations.ts
    education.hooks.ts

Each feature owns:

- its API
- its query keys
- its mutations
- its hooks

No global dumping ground.

---

# 1️⃣3️⃣ AI Prompt You Can Reuse

Use this prompt when asking AI:

"I am building a scalable React application using TanStack Query and TypeScript. I want hierarchical, predictable query keys using a factory pattern. Help me design domain-based query keys, mutation keys, cache invalidation strategy, dependent queries, prevent over-fetching, memoize params properly, and structure my feature folders like an enterprise-grade frontend."

---

# 1️⃣4️⃣ Refactored Example (Your Original Code)

## Query

```ts
const { data: educationalLevels, isLoading } =
  useFetch({
    queryFn: getAllEduLevelsFn,
    queryKey: eduKeys.levels(),
  });
```

## Invalidate

```ts
const invalidate = () =>
  qc.invalidateQueries({
    queryKey: educationKeys.all,
  });
```

## Create

```ts
const { mutate: addEduLevel } = usePost({
  mutationKey: educationMutationKeys.create,
  postFn: createEduLevelFn,
  onSuccess: () => invalidate(),
});
```

## Update

```ts
const { mutate: updateEduLevel } = useUpdate({
  mutationKey: educationMutationKeys.update,
  updateFn: updateEduLevelFn,
  onSuccess: () => invalidate(),
});
```

## Delete

```ts
const { mutate: deleteEduLevel } = usePost({
  mutationKey: educationMutationKeys.delete,
  postFn: deleteEduLevelFn,
  onSuccess: () => invalidate(),
});
```

---

# 1️⃣5️⃣ Final Principles

1. Always use param objects
2. Always group by domain
3. Invalidate minimally
4. Memoize param objects when derived
5. Design for filters & pagination from day one
6. Keep keys inside feature folder
7. Avoid primitive-spread query keys
8. Dependent queries must use `enabled`
9. Prefer optimistic updates when possible
10. Think in domains, not endpoints

---

END OF GUIDE



# Examples
```ts
const { data: educationalLevels, isLoading: loadingEducationalLevels } =
  useFetch({
    queryFn: getAllEduLevelsFn,
    queryKey: eduKeys.levels(),
  });

const invalidate = () =>
    qc.invalidateQueries({
        queryKey: educationKeys.all,
    });

const { mutate: addEduLevel, isPending: addingEduLevel } = usePost({
  mutationKey: educationMutationKeys.create,
  postFn: createEduLevelFn,
  onSuccess: ({ responseCode, responseMessage }) => {
    if (responseCode === 1) {
      invalidate();
      toast.success(responseMessage);
      form.resetFields();
    } else {
      toast.error(responseMessage);
    }
  },
  onError: (err) => {
    toast.error(`Failed to create educational level`, {
      description: err?.message,
    });
  },
});

const { mutate: updateEduLevel, isPending: updatingEduLevel } = useUpdate({
  mutationKey: educationMutationKeys.update,
  updateFn: updateEduLevelFn,
  onSuccess: ({ responseCode, responseMessage }) => {
    if (responseCode === 1) {
      invalidate();
      toast.success(responseMessage);
      form.resetFields();
    } else {
      toast.error(responseMessage);
    }
  },
  onError: (err) => {
    toast.error(`Failed to edit educational level`, {
      description: err?.message,
    });
  },
});
const { mutate: deleteEduLevel, isPending: deletingEduLevel } = usePost({
  mutationKey: educationMutationKeys.delete,
  postFn: deleteEduLevelFn,
  onSuccess: ({ responseCode, responseMessage }) => {
    if (responseCode === 1) {
      invalidate();
      toast.success(responseMessage);
      form.resetFields();
    } else {
      toast.error(responseMessage);
    }
  },
  onError: (err) => {
    toast.error(`Failed to delete educational level`, {
      description: err?.message,
    });
  },
});
```