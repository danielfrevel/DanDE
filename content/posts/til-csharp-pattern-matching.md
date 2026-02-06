---
title: "TIL: C# Pattern Matching Goes Further Than I Thought"
date: 2026-01-28
description: "Property patterns and relational patterns make switch expressions surprisingly powerful."
tags: ["csharp", "til"]
---

I was refactoring a chain of `if/else` blocks that checked nested properties and ranges. The usual mess. Then I remembered C# pattern matching has gotten way better since I last looked.

Before:

```csharp
if (order.Status == "active" && order.Total > 100 && order.Customer.Tier == "gold")
    discount = 0.15m;
else if (order.Status == "active" && order.Total > 50)
    discount = 0.05m;
else
    discount = 0m;
```

After:

```csharp
var discount = order switch
{
    { Status: "active", Total: > 100, Customer.Tier: "gold" } => 0.15m,
    { Status: "active", Total: > 50 } => 0.05m,
    _ => 0m
};
```

Property patterns with relational operators (`> 100`) and nested access (`Customer.Tier`) — all in one expression. The compiler even warns you about missing cases. This should have been my default years ago.
