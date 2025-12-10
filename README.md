# REOP (Real Estate Open Protocol)

The official repository for the Real Estate Open Protocol (REOP).

REOP is an open-source, vendor-neutral standard for structuring, exchanging, and consuming complex real estate development data (Off-Plan/Pre-Sale). It aims to solve the industry's data fragmentation crisis by providing a single, machine-readable JSON schema for all digital systems, from AI agents to marketplaces.

## 🚀 Vision: The Golden Record

Real estate data today is trapped in PDFs, ad-hoc feeds, and unstructured websites. REOP is the solution, defining **what** data is exchanged and **how** it evolves over time.

Our goal is simple: **Don't be invisible to the future.** The data must be ready for autonomous AI agents and modern digital platforms.

## 🛠️ Protocol Structure

The REOP protocol models the real estate domain as a flexible hierarchy:

`Developer` → `Project` → `Building` → `Floor` → `UnitModel` → `Unit`

### Key Features of the Protocol 

* **Decoupled Inventory:** Supports both the high-level **Unit Model** (Type A) and the granular **Unit** (Specific Inventory), allowing projects to be listed even if availability is limited.
* **Inheritance & Overrides:** Data defined at a higher level (e.g., Project Amenities) propagates downward to children, minimizing payload size and redundancy.
* **AI-Ready Fields:** Includes necessary fields for semantic matching, such as `orientation`, `legalInfo` (Escrow/Bank), and multilingual descriptions (`he`/`en`).
* **Delta-Friendly:** Supports partial updates for rapid changes in pricing and availability.

## 📜 Current Specification (v1.1.0)

You can find the definitive protocol files here:

| File | Description |
| :--- | :--- |
| **`specifications/reop-v1.1.0.yaml`** | The full OpenAPI 3.1.0 definition, including all component schemas (The Contract). |
| **`examples/reop_v1.1.0-min.json`** | A fully populated example of a Tel Aviv project, demonstrating data structure and hierarchy. |

---

## 🤝 Community & Contribution

REOP is an open protocol. We welcome feedback, bug reports, and proposals for new fields (e.g., for Commercial Real Estate in `vNext`).

* **Discussions:** Got a question? Want to suggest an improvement? Head over to the **Discussions** tab.
* **Bugs:** Report issues or errors in the existing specification via **Issues**.

### Get Started

1.  **Read the Specs:** [View the full interactive documentation on Redoc](https://reop.io/spec.html)
2.  **Start Building:** Access the API endpoints at `https://api.reop.io/v1`.

For commercial inquiries or partnership opportunities, please contact `info@reop.io`.
