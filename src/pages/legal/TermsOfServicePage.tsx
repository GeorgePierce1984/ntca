import React from "react";
import { PageTemplate } from "@/components/PageTemplate";

export const TermsOfServicePage: React.FC = () => {
  return (
    <PageTemplate
      title="Terms & Conditions"
      subtitle="Please read these Terms carefully before using NT-CA"
      showComingSoon={false}
    >
      <div className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p>
                  These Terms govern your use of NT-CA (“we”, “us”, “our”) and
                  the NT-CA platform (the “Platform”). By using the Platform you
                  agree to these Terms.
                </p>

                <h2>1. About NT-CA</h2>
                <p>
                  NT-CA operates an online platform that facilitates
                  connections between educational institutions (“Schools”) and
                  individual teachers or candidates (“Teachers”).
                </p>
                <p>
                  We are not an employer, recruitment agency, visa sponsor,
                  payroll provider, or contracting party.
                </p>

                <h2>2. Platform Role & Disclaimer</h2>
                <p>NT-CA is a neutral technology platform.</p>
                <p>We do not:</p>
                <ul>
                  <li>Employ Teachers</li>
                  <li>Vet or guarantee Teachers or Schools</li>
                  <li>Negotiate contracts</li>
                  <li>Handle payments or payroll</li>
                  <li>Sponsor visas or immigration processes</li>
                  <li>Provide legal, tax, or employment advice</li>
                </ul>
                <p>
                  All interactions, negotiations, contracts, payments, and
                  disputes occur directly between Schools and Teachers.
                </p>

                <h2>3. User Responsibilities</h2>
                <p>Users agree to:</p>
                <ul>
                  <li>Provide accurate, lawful, and up-to-date information</li>
                  <li>
                    Comply with all local employment, immigration, tax, and
                    labour laws
                  </li>
                  <li>
                    Conduct their own due diligence, background checks, and
                    references
                  </li>
                  <li>
                    Ensure job postings comply with anti-discrimination laws
                  </li>
                </ul>

                <h2>4. No Guarantees</h2>
                <p>We do not guarantee:</p>
                <ul>
                  <li>Accuracy of profiles or job listings</li>
                  <li>Suitability of candidates or employers</li>
                  <li>Successful hiring outcomes</li>
                  <li>Compliance of users with laws</li>
                </ul>

                <h2>5. Payments</h2>
                <p>
                  NT-CA is not responsible for any payment, salary, fee,
                  commission, or benefit exchanged between Schools and Teachers.
                </p>
                <p>
                  All financial arrangements are made outside the Platform
                  unless explicitly stated otherwise.
                </p>

                <h2>6. Liability Limitation</h2>
                <p>To the maximum extent permitted by law:</p>
                <ul>
                  <li>
                    We exclude all liability for indirect, consequential, or
                    economic loss
                  </li>
                  <li>
                    Our total liability shall not exceed the greater of £100 or
                    fees paid in the last 12 months
                  </li>
                  <li>
                    We are not liable for disputes, misconduct, fraud, or
                    breaches of contract between users
                  </li>
                </ul>

                <h2>7. Indemnity</h2>
                <p>
                  Users agree to indemnify NT-CA against any claims, losses, or
                  legal actions arising from:
                </p>
                <ul>
                  <li>Employment disputes</li>
                  <li>Immigration breaches</li>
                  <li>Discrimination claims</li>
                  <li>Data misuse</li>
                  <li>Contractual disputes</li>
                </ul>

                <h2>8. Content</h2>
                <p>
                  Users grant NT-CA a worldwide licence to host, display, and
                  distribute submitted content for Platform operation.
                </p>
                <p>
                  Users confirm they have rights to upload personal data, CVs,
                  references, and other submitted materials.
                </p>

                <h2>9. Termination</h2>
                <p>
                  We may suspend or terminate accounts at any time for breach
                  or risk.
                </p>

                <h2>10. Governing Law</h2>
                <p>
                  These Terms are governed by the laws of England and Wales.
                  Courts of England have exclusive jurisdiction.
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-4 text-center">
              For the live Terms page, see{" "}
              <a
                href="/terms"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                /terms
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};
