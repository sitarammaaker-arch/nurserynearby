import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE.name}`,
  description: "NurseryNearby Privacy Policy — how we collect, use and protect your personal information.",
  alternates: { canonical: `${SITE.url}/privacy` },
};

const LAST_UPDATED = "March 2026";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="gradient-sage border-b border-gray-100 py-16">
          <div className="container max-w-3xl">
            <span className="badge badge-green mb-4">Legal</span>
            <h1 className="font-display text-4xl font-bold text-forest-900 mb-3">Privacy Policy</h1>
            <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container max-w-3xl prose prose-gray max-w-none">
            {[
              {
                title: "1. Introduction",
                body: `Welcome to NurseryNearby ("we", "our", "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website nurserynearby.vercel.app and use our services.`,
              },
              {
                title: "2. Information We Collect",
                body: `We may collect information you provide directly to us, such as:
• Name, email address and phone number when you contact us or list a nursery
• Business information when you register a nursery listing
• Reviews and ratings you submit for nurseries
• Search queries and location data to help you find nurseries near you

We also automatically collect certain information when you visit our website, including IP address, browser type, operating system, referring URLs and pages viewed.`,
              },
              {
                title: "3. How We Use Your Information",
                body: `We use the information we collect to:
• Provide, maintain and improve our directory services
• Verify nursery listings and prevent fraudulent content
• Send you confirmation emails when you list a nursery
• Respond to your comments and questions
• Monitor and analyze usage patterns to improve user experience
• Comply with legal obligations`,
              },
              {
                title: "4. Information Sharing",
                body: `We do not sell, trade or rent your personal information to third parties. We may share information in the following circumstances:
• With nursery owners when you express interest in their listing (e.g., phone number shown publicly)
• With service providers who assist in operating our website (hosting, analytics)
• When required by law or to protect our rights
• In connection with a merger or acquisition (users will be notified)`,
              },
              {
                title: "5. Nursery Listing Information",
                body: `When nursery owners list their business on NurseryNearby, the following information becomes publicly visible: business name, address, phone number, photos, categories, opening hours and description. Nursery owners are responsible for ensuring the accuracy of this information and that they have the right to share it.`,
              },
              {
                title: "6. Cookies",
                body: `We use cookies and similar tracking technologies to track activity on our website and improve user experience. Cookies are small files stored on your device. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent. However, some features of our service may not function properly without cookies.`,
              },
              {
                title: "7. Data Security",
                body: `We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.`,
              },
              {
                title: "8. Your Rights",
                body: `You have the right to:
• Access the personal information we hold about you
• Request correction of inaccurate information
• Request deletion of your personal data
• Opt out of marketing communications
• Lodge a complaint with the relevant data protection authority

To exercise these rights, please contact us at support@nurserynearby.in`,
              },
              {
                title: "9. Children's Privacy",
                body: `Our services are not directed to children under the age of 13. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.`,
              },
              {
                title: "10. Changes to This Policy",
                body: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated date. Your continued use of our services after changes constitutes acceptance of the updated policy.`,
              },
              {
                title: "11. Contact Us",
                body: `If you have questions or concerns about this Privacy Policy, please contact us at:
Email: support@nurserynearby.in
Website: nurserynearby.vercel.app/contact`,
              },
            ].map((section) => (
              <div key={section.title} className="mb-10">
                <h2 className="font-display text-xl font-bold text-forest-900 mb-3 pb-2 border-b border-gray-100">
                  {section.title}
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
