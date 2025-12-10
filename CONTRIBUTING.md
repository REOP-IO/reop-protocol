# Contributing to the REOP Protocol

Thank you for your interest in contributing to the Real Estate Open Protocol (REOP). As an open standard, its success depends on industry input.

[cite_start]Our primary goal is **Clarity and Stability**[cite: 14]. [cite_start]We use [Semantic Versioning (SemVer)] to maintain clear upgrade paths[cite: 9].

## 💡 How to Propose Changes

All proposed changes must be submitted via the **GitHub Discussions** feature before opening a Pull Request.

### 1. Protocol Stability (Important)

* **Backward Compatibility:** All changes to the current `v1.1.0` branch must be backward compatible (e.g., only adding new, optional fields). [cite_start]Breaking changes will be reserved for future major versions (e.g., `v2.0.0`)[cite: 19].
* [cite_start]**Deprecation:** If you propose removing an existing field, you must provide a clear deprecation plan (Evolvability)[cite: 19].

### 2. General Guidelines

* [cite_start]**Scope:** Ensure your proposal is within the current scope (Residential, Investment, Vacation Properties)[cite: 50].
* **Clarity:** Provide a clear use case for why the new field or structure is necessary, referencing real-world data problems (e.g., "We need this for regulatory compliance in Country X").

### 3. Process Checklist

1.  **Discussion:** Start a new thread in the **Discussions** tab under the **"Protocol Proposals"** category.
2.  **Consensus:** Gain initial community and maintainer consensus on the concept.
3.  **Pull Request (Final Step):** Once approved in principle, fork the repository and submit a Pull Request (PR) against the primary `main` branch.
    * Your PR should only modify files within the `/specifications` folder.
    * Please ensure the YAML remains valid.

We look forward to collaborating with you to define the future of real estate data!
