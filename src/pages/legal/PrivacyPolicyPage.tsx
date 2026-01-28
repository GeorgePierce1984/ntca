import React from "react";
import { PageTemplate } from "@/components/PageTemplate";

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageTemplate
      title="Privacy Policy"
      subtitle="Global GDPR-based privacy framework"
      showComingSoon={false}
    >
      <div className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h2>2. PRIVACY POLICY (GLOBAL GDPR-BASED)</h2>

                <h3>2.1 Introduction</h3>
                <p>
                  NT-CA processes personal data in accordance with UK GDPR, EU
                  GDPR, CCPA/CPRA, PIPEDA, Australian Privacy Act, and New
                  Zealand Privacy Act.
                </p>

                <h3>2.2 Data Controller</h3>
                <p>
                  NT-CA Ltd is the Data Controller. Contact:{" "}
                  <a href="mailto:privacy@nt-ca.com">privacy@nt-ca.com</a>
                </p>

                <h3>2.3 Data Collected</h3>
                <ul>
                  <li>Identity data (name, contact details)</li>
                  <li>Professional data (CVs, qualifications, references)</li>
                  <li>Technical data (IP, device, logs)</li>
                  <li>Usage data</li>
                  <li>Sensitive data only where voluntarily provided</li>
                </ul>

                <h3>2.4 Legal Bases for Processing (GDPR)</h3>
                <ul>
                  <li>Consent</li>
                  <li>Contract performance</li>
                  <li>Legitimate interests</li>
                  <li>Legal obligations</li>
                </ul>

                <h3>2.5 Purposes of Processing</h3>
                <ul>
                  <li>Matching Teachers and Schools</li>
                  <li>Platform communications</li>
                  <li>Service improvement and analytics</li>
                  <li>Legal compliance</li>
                </ul>

                <h3>2.6 Data Sharing</h3>
                <p>Data may be shared with:</p>
                <ul>
                  <li>Schools when Teachers apply or opt-in</li>
                  <li>Hosting and analytics providers</li>
                  <li>Legal authorities where required</li>
                </ul>

                <h3>2.7 International Transfers</h3>
                <p>
                  Data stored in the UK. Transfers rely on adequacy decisions
                  or Standard Contractual Clauses.
                </p>

                <h3>2.8 User Rights</h3>
                <p>
                  Users may request access, rectification, erasure, restriction,
                  portability, or objection. Requests handled within one month.
                </p>

                <h3>2.9 Retention</h3>
                <p>Data retained until account deletion or legal requirement.</p>

                <h3>2.10 Security</h3>
                <p>
                  Encryption, access controls, and organisational safeguards are
                  implemented.
                </p>

                <h3>2.11 Complaints</h3>
                <p>
                  Users may complain to the UK ICO or relevant supervisory
                  authority.
                </p>

                <hr />

                <h2>3. CONTROLLER-TO-CONTROLLER DATA SHARING AGREEMENT</h2>

                <h3>3.1 Parties</h3>
                <p>
                  NT-CA Ltd and Schools receiving Teacher data are independent
                  Data Controllers.
                </p>

                <h3>3.2 Purpose</h3>
                <p>Data shared for recruitment and hiring purposes.</p>

                <h3>3.3 Obligations</h3>
                <p>Schools must:</p>
                <ul>
                  <li>Comply with GDPR and local privacy laws</li>
                  <li>Provide privacy notices to Teachers</li>
                  <li>Secure data and restrict access</li>
                  <li>Delete data when no longer necessary</li>
                </ul>

                <h3>3.4 Liability</h3>
                <p>
                  Each party is responsible for its own compliance. Schools
                  indemnify NT-CA for misuse of shared data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};
