---
title: "Debugging Angular Signals: A Quick Trick"
date: 2026-02-02
description: "Use effect() to trace signal changes during development."
tags: ["angular", "debugging"]
---

Signals don't show up in the regular change detection logs. When something's not updating and you can't figure out why, drop an `effect()` in your component:

```typescript
import { effect, signal, computed } from '@angular/core';

export class CartComponent {
  items = signal<CartItem[]>([]);
  total = computed(() => this.items().reduce((sum, i) => sum + i.price, 0));

  constructor() {
    effect(() => {
      console.log('items changed:', this.items());
      console.log('total is now:', this.total());
    });
  }
}
```

The `effect()` runs whenever any signal it reads changes. It automatically tracks dependencies — no need to specify what to watch.

**Remove this before committing.** Effects for debugging are like `console.log` — useful in the moment, noise in production. If you need persistent side effects, there are better patterns for that.
