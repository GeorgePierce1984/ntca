import React from "react";
import { PageTemplate } from "@/components/PageTemplate";

export const TermsOfServicePage: React.FC = () => {
  return (
    <PageTemplate
      title="Terms of Service"
      subtitle="NT‑CA Legal Framework Documents (Draft)"
      showComingSoon={false}
    >
      <div className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p>
                  <strong>NT‑CA LEGAL FRAMEWORK DOCUMENTS (DRAFT)</strong>
                </p>
                <p>
                  <strong>Jurisdictions Covered:</strong> United Kingdom, European
                  Union, United States, Canada, Australia, New Zealand
                  <br />
                  <strong>Last Updated:</strong> 28 January 2026
                </p>

                <h2>1. TERMS OF SERVICE (PLATFORM USERS)</h2>

                <h3>1.1 Introduction</h3>
                <p>
                  These Terms of Service (&quot;Terms&quot;) govern access to and
                  use of the NT‑CA platform (the &quot;Platform&quot;), operated
                  by NT‑CA Ltd (&quot;NT‑CA&quot;, &quot;we&quot;,
                  &quot;us&quot;, &quot;our&quot;).
                </p>
                <p>
                  By accessing or using the Platform, you agree to these Terms.
                  If you do not agree, do not use the Platform.
                </p>

                <h3>1.2 Definitions</h3>
                <ul>
                  <li>
                    <strong>Platform:</strong> The NT‑CA website, mobile
                    applications, APIs, and related services.
                  </li>
                  <li>
                    <strong>School:</strong> Any educational institution or
                    organisation posting opportunities.
                  </li>
                  <li>
                    <strong>Teacher:</strong> Any individual candidate using the
                    Platform.
                  </li>
                  <li>
                    <strong>User:</strong> Any person accessing or using the
                    Platform.
                  </li>
                  <li>
                    <strong>Content:</strong> All data, text, CVs, profiles,
                    messages, and materials uploaded or generated.
                  </li>
                </ul>

                <h3>1.3 Platform Role and Disclaimer</h3>
                <p>
                  NT‑CA is a technology marketplace that facilitates connections
                  between Schools and Teachers.
                </p>
                <p>NT‑CA:</p>
                <ul>
                  <li>Does not employ Teachers</li>
                  <li>
                    Is not a recruitment agency, employment business, or labour
                    provider
                  </li>
                  <li>
                    Does not negotiate or enter into contracts on behalf of
                    Users
                  </li>
                  <li>
                    Does not handle payroll, benefits, taxes, visas, or
                    immigration sponsorship
                  </li>
                  <li>Does not verify or guarantee the accuracy of User Content</li>
                </ul>
                <p>
                  All hiring decisions, contracts, payments, and legal
                  obligations are solely between Schools and Teachers.
                </p>

                <h3>1.4 Eligibility</h3>
                <p>
                  Users must be at least 18 years old. Schools represent that
                  they have authority to post opportunities. Teachers represent
                  that they are legally entitled to seek employment.
                </p>

                <h3>1.5 User Obligations</h3>
                <p>Users agree to:</p>
                <ul>
                  <li>Provide accurate, lawful, and non-misleading information</li>
                  <li>Comply with all employment, immigration, tax, and labour laws</li>
                  <li>Conduct independent due diligence and background checks</li>
                  <li>Avoid discriminatory, abusive, or unlawful content</li>
                </ul>

                <h3>1.6 Fees and Payments</h3>
                <p>
                  Unless explicitly stated otherwise, NT‑CA does not process
                  payments between Schools and Teachers. Any subscription or
                  platform fees are payable to NT‑CA separately and are
                  non-refundable unless required by law.
                </p>

                <h3>1.7 Intellectual Property</h3>
                <p>
                  NT‑CA retains all rights in the Platform. Users grant NT‑CA a
                  worldwide, non-exclusive, royalty-free licence to host,
                  display, and process Content for Platform operations.
                </p>

                <h3>1.8 Confidentiality</h3>
                <p>
                  Users are responsible for safeguarding confidential
                  information disclosed through the Platform.
                </p>

                <h3>1.9 Warranties and Disclaimers</h3>
                <p>
                  The Platform is provided &quot;as is&quot; and &quot;as
                  available&quot; without warranties of any kind. NT‑CA
                  disclaims all implied warranties, including merchantability
                  and fitness for purpose.
                </p>

                <h3>1.10 Limitation of Liability</h3>
                <p>To the maximum extent permitted by law:</p>
                <ul>
                  <li>NT‑CA shall not be liable for indirect, consequential, or economic loss</li>
                  <li>NT‑CA shall not be liable for disputes between Users</li>
                  <li>
                    Total liability shall not exceed the greater of £100 or fees
                    paid in the preceding 12 months
                  </li>
                </ul>

                <h3>1.11 Indemnity</h3>
                <p>Users indemnify NT‑CA against claims arising from:</p>
                <ul>
                  <li>Employment disputes</li>
                  <li>Immigration violations</li>
                  <li>Discrimination claims</li>
                  <li>Data misuse</li>
                  <li>Breach of these Terms</li>
                </ul>

                <h3>1.12 Termination</h3>
                <p>NT‑CA may suspend or terminate accounts at its discretion.</p>

                <h3>1.13 Governing Law and Jurisdiction</h3>
                <p>
                  These Terms are governed by the laws of England and Wales.
                  Courts of England have exclusive jurisdiction.
                </p>

                <h3>1.14 Arbitration and Class Action Waiver (US Users)</h3>
                <p>
                  US Users agree to binding arbitration and waive class actions
                  where permitted by law.
                </p>

                <h3>1.15 Force Majeure</h3>
                <p>
                  NT‑CA is not liable for failures due to events beyond
                  reasonable control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};
