---
title: "Setting Up a Dev Shell with Nix Flakes"
date: 2026-01-20
description: "A minimal flake.nix for reproducible dev environments."
tags: ["nix", "tooling"]
---

Every project I join has a different setup doc. Half the steps are outdated. Nix flakes fix this — one file, one command, done.

Here's a minimal `flake.nix` for a Node + Python project:

```nix
{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs_22
          python312
          python312Packages.pip
        ];

        shellHook = ''
          echo "dev shell ready"
        '';
      };
    };
}
```

Run `nix develop` and you're in. Everyone on the team gets the exact same versions. No "works on my machine", no version managers, no install scripts.

The key insight: `flake.lock` pins everything. Commit it to git and your environment is reproducible across machines and months.
