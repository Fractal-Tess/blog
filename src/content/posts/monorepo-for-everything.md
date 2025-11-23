---
title: "You should be using a monorepo... For everything"
published: 2025-11-22
description: "A deep dive into why monorepos are superior despite their challenges, covering tooling, dependency management, and atomic refactors."
tags:
  - monorepo
  - architecture
  - opinion
  - dx
draft: false
---

There are only few topics that spark as much debate as the repository structure  - at least that is the case for me and my boss.

"Monorepo vs. Polyrepo" is the new "Sliders vs. Carousel", but with significantly higher stakes for the developer experience and the velocity of development.

I'm here to take a stance: **You should be using a monorepo.** And not just for your company's microservices—but arguably for almost everything you build.

Is it perfect? No. Is it painful at times? Absolutely. But the alternatives are often silent killers of productivity.

## The Concerns

Let me address the elephant in the room—or rather, let's hear from a skeptical developer.

:::duck
This all sounds great in theory, but we already have multiple repositories set up. Can't we just migrate to a monorepo later when we have time?
:::

:::unicorn{align="right"}
Ah, the classic "we'll do it later" trap! Here's the thing: if your codebase has already sprawled across multiple repos, migrating becomes exponentially harder. It's not just moving files around—you're untangling years of dependency spaghetti, synchronizing build pipelines, and retraining entire teams. I've seen migration projects get quoted at 6 months and never get approved.

That's why starting with a monorepo from day one is so important. It's like trying to merge lanes in heavy traffic versus starting in the right lane from the beginning.
:::

:::duck
This sounds overwhelming. When I open a repository and see hundreds of directories and thousands of files, how am I supposed to manage that cognitive load?
:::

:::unicorn{align="right"}
I hear this a lot, but it's largely a tooling problem that's already solved. Modern IDEs let you focus on exactly what you need—most developers only interact with 5-10% of the codebase daily. Use VS Code's workspace settings, "Exclude from Search", or just good folder structures to narrow your focus to the `apps/my-service` directory you actually care about.

But here's the real benefit: when Service A talks to Service B and something breaks, you can jump directly to both codebases in the same editor. No cloning different repos, no multiple windows, no context switching. You can search across both services simultaneously and trace the entire request lifecycle. What seemed like a size problem becomes a debugging superpower.
:::

:::duck
What about ownership? In separate repos, if you own the repository, you own the code. But in a monorepo, who owns the shared libraries?
:::

:::unicorn{align="right"}
Use **CODEOWNERS** files. They let you set directory-level permissions—when someone opens a PR touching files in a protected directory, the system automatically requests reviews from the designated owners. You get the clarity of polyrepo ownership with monorepo convenience.
:::


```gitignore title=".github/CODEOWNERS"
# Platform team owns shared infra
/packages/infra/ @org/platform-team

# UI team owns the component library
/packages/ui-kit/ @org/ui-team

# Backend team owns the API
/apps/api/ @org/backend-leads
```


:::duck
But doesn't forcing everyone to use the same tools and versions feel restrictive? Teams lose their autonomy to choose their own frameworks and build tools.
:::

:::unicorn{align="right"}
While it sounds restrictive, it's actually a blessing. In polyrepo setups, autonomy leads to fragmentation: five different testing frameworks, incompatible TypeScript versions, configs no one understands. The monorepo's alignment reduces cognitive overhead through consistency. Once you learn the patterns in one part of the codebase, those patterns apply everywhere. It eliminates decision fatigue, and the friction of alignment pays off in mobility and standardized excellence.
:::


## The Real-World Scenarios

Now for the practical questions—the scenarios that come up in actual development.

:::duck
Okay, so how do we share code between services? Do we publish libraries to npm and then import them?
:::

:::unicorn{align="right"}
You *could*, but then you're making a change, publishing it, then spending weeks bumping versions across services as teams find time to upgrade. Meanwhile you're maintaining multiple versions and backporting bug fixes.
:::

:::duck
What about git submodules?
:::

:::unicorn{align="right"}
Even worse. Submodules are notorious: nested `.git` directories, manual update commands, detached HEAD states, merge conflicts in `.gitmodules`. When someone updates the submodule, everyone else needs to manually pull and update.

In a monorepo, you edit the code in `packages/shared-utils`, run tests for all dependent apps immediately, and merge. Everyone is on the latest version instantly—no publishing, no version management nightmare.
:::

:::duck
Wait, does using a monorepo mean we can't publish to npm anymore?
:::

:::unicorn{align="right"}
Not at all! Most popular open source projects use this exact approach. Vercel, Svelte, Convex, Supabase—they all develop in monorepos with multiple packages, then publish to npm for external users. Internally, they get monorepo benefits (atomic commits, easy refactoring, shared tooling). Externally, users consume them as normal npm packages. Best of both worlds!


And when you need versioning, monorepos work beautifully with tools like [**Changesets**](https://github.com/changesets/changesets). Developers add a markdown file describing changes, and Changesets handles semantic versioning, changelogs, and coordinated releases automatically.
:::

:::tip
**Did you know?** Most modern monorepos use this exact approach.


A monorepo with multiple packages, change tracking and version managment by changesets, then publishing to npm for external users. 
:::

---
<div align="center">

**Some monorepos examples:**

</div>

::github{repo="sveltejs/svelte"}
::github{repo="vercel/next.js"}
::github{repo="withastro/astro"}
::github{repo="supabase/supabase"}
::github{repo="tauri-apps/tauri"}

---


:::duck
Speaking of changes—what about refactoring? Don't atomic changes across the entire codebase become risky?
:::

:::unicorn{align="right"}
Actually, it's the opposite. Want to change a core API method's signature? In a polyrepo, you need a multi-week dance: add the new signature for backwards compatibility, publish, coordinate upgrades, then deprecate the old one. In a monorepo, you update the API and *every usage of it* in the same PR. The compiler shows you all call sites. You fix them atomically, CI validates everything works, and you merge with confidence.
:::

:::tip
**Codemods at Scale**: This structure allows you to run AST transformations across the entire company.
:::

:::duck
But if one test fails, doesn't that block everyone from merging?
:::

:::unicorn{align="right"}
In a mature monorepo setup, breaking `main` should be theoretically impossible. CI runs tests across the *entire affected graph* for every PR. If you modify a shared utility, CI automatically identifies all dependent services and validates them before allowing the merge. Tools like merge queues ensure that even if two PRs pass individually, they're validated together before landing.
:::

:::duck
This all sounds complex to set up. Don't I need a PhD in build systems?
:::

:::unicorn{align="right"}
That's an outdated myth from the pre-2020 era. Modern tools like **Turborepo** are almost zero-config. Add a simple `turbo.json` file, run `npx turbo build`, and you're done. No complex Webpack configs, no custom CI scripts. Today's tools learned from years of battle-testing at companies like Vercel and Google, packaging all that complexity into simple, ergonomic interfaces.

Creating a new library is often just `mkdir packages/new-lib`. Your new package immediately inherits all organizational standards—linting, testing, build configuration. Within minutes, other packages can import from it.
:::

:::duck
Okay, but surely builds must take forever with everything in one place?
:::

:::unicorn{align="right"}
It used to. But tools like **Turborepo**, **Nx**, and **Bazel** changed the game with three key features:

**Remote Caching**: Your entire team's development history becomes a shared cache. When your coworker builds a package, artifacts are cached remotely. When you check out the same commit, you download the cached result instantly. What took 20 minutes might now take 30 seconds.

**Affected Only**: You stop validating code you didn't touch. Change a file in `frontend`, and the build system skips `backend` tests entirely. CI times grow with the size of your changes, not your codebase.

**Parallel Builds**: Modern tools understand the dependency graph and build independent packages simultaneously, maximizing CPU utilization.
:::

:::duck
What about keeping code organized? Won't everything become spaghetti?
:::

:::unicorn{align="right"}
Monorepos are actually the best tool for **Domain Driven Design**. With tools like Nx's module boundaries or ESLint rules, you can define strict architectural boundaries. For example, enforce that the `payment` domain can never import from `social-features`. These boundaries are *enforced at build time* rather than relying on organizational discipline.
:::

:::duck
Okay, I'm sold on the benefits for large companies with multiple services. But why did you say we should use monorepos for *everything*? That seems extreme for small projects.
:::

:::unicorn{align="right"}
Here's the thing: you never know which project will grow. That side project you're building alone today might need a mobile app next month, or a CLI tool, or a separate admin dashboard. By the time you realize you need multiple packages, you're already dealing with the pain of splitting things up or managing multiple repos.

Starting with a monorepo costs you nothing—even with a single project inside. You still get the benefits of modern tooling like remote caching and fast builds. But you've already laid the foundation. When you need to add that second app or extract a shared library, the infrastructure is ready and waiting. No migration, no refactoring, no lost productivity.

Think of it like buying a dining table that can extend. Sure, you might only need four seats today, but having the option costs nothing and saves you from buying a whole new table later.
:::

## You're in Good Company

If you're still skeptical, consider that the world's most sophisticated engineering organizations figured this out decades ago:

* **Google**: Their monorepo contains billions of lines of code—they literally built **Bazel** to make it work at that scale.
* **Meta**: Runs tens of thousands of developers in a single repository.
* **Uber**: Migrated from thousands of polyrepos specifically to solve dependency hell, with documented improvements in their first year.

These aren't just tech giants with unlimited resources. Projects like Vercel, Svelte, Supabase, and countless others use monorepos because the benefits are real and the tooling is accessible.

## My Personal Take

Here's something I strongly believe: **everyone should create their own monorepo template.**

I'm talking about a personal starter with your go-to stack: your preferred UI framework, a website setup, a docs site, a simple service runtime, and all the bells and whistles — CI/CD pipelines, linting, formatting, the works. Pre-configure everything exactly how you like it.

Yes, it's a time investment. A significant one. You'll spend hours (maybe days) getting your `tsconfig` just right, setting up your build pipelines, configuring your tooling. But here's the payoff: you do it **once**.

After that? **You never waste time configuring projects from scratch ever again**. Every new idea, side project, or client work starts from a battle-tested foundation. No more "should I use ESLint flat config or the old one?" No more "which TypeScript settings do I need again?" No more copy-pasting CI workflows and fixing the paths.

Clone your template, run the setup script, and start building. The infrastructure is already there, already working, already optimized. You go from idea to first commit in minutes instead of hours.

## Conclusion

The tooling is mature. The patterns are proven. The investment is minimal, but the payoff is enormous.


> "Good programmers know what to write. Great ones know what to rewrite and reuse."  
>
> — **Eric S. Raymond**


