"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon } from "./ui";
import type { PricingTier } from "../lib/content";

export function PricingTable({ tiers }: { tiers: PricingTier[] }) {
  const [annual, setAnnual] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${annual ? "text-muted" : "text-ink"}`}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          aria-label="Bill annually"
          onClick={() => setAnnual((value) => !value)}
          className={`relative h-7 w-12 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
            annual ? "bg-primary-500" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
              annual ? "left-6" : "left-1"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${annual ? "text-ink" : "text-muted"}`}
        >
          Annual
          <span className="ml-1.5 rounded-none bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-600">
            2 months free
          </span>
        </span>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-none border bg-surface p-8 ${
              tier.popular
                ? "border-line border-t-2 border-t-primary-400 shadow-lg shadow-navy-900/5"
                : "border-line"
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-none bg-primary-500 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white">
                Most popular
              </span>
            )}
            <h2 className="font-display text-xl font-medium tracking-tight text-ink">
              {tier.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{tier.blurb}</p>
            <p className="mt-6 flex items-baseline gap-1.5">
              <span className="text-sm text-muted">from</span>
              <span className="font-display text-4xl font-medium tracking-tight text-ink">
                €{annual ? tier.annualMonthly : tier.monthly}
              </span>
              <span className="text-sm text-muted">/mo + VAT</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              {annual ? "billed annually" : "billed monthly, cancel any time"}
            </p>
            <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-line pt-6">
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm leading-6 text-ink-body"
                >
                  <span className="mt-1 text-primary-500">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className={`mt-8 inline-flex h-11 cursor-pointer items-center justify-center rounded-none px-6 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                tier.popular
                  ? "bg-primary-500 text-white hover:bg-primary-600 focus-visible:outline-primary-500"
                  : "bg-navy-900 text-white hover:bg-navy-700 focus-visible:outline-navy-700"
              }`}
            >
              Get started
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
