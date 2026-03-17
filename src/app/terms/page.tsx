import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Terms of Use — ${SITE.name}`,
  description: "NurseryNearby Terms of Use — rules governing use of our plant nursery directory.",
  alternates: { canonical: `${SITE.url}/terms` },
};

const LAST_UPDATED = "March 2026";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="gradient-sage border-b border-gray-100 py-16">
          <div className="container max-w-3xl">
            <span className="badge badge-green mb-4">Legal</span>
            <h1 className="font-display text-4xl font-bold text-forest-900 mb-3">Terms of Use</h1>
            <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container max-w-3xl">
            {[
              {
                title: "1. Acceptance of Terms",
                body: `By accessing and using NurseryNearby ("the Service"), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our service. We reserve the right to modify these terms at any time, and your continued use of the service constitutes acceptance of any changes.`,
              },
              {
                title: "2. Use of the Service",
                body: `NurseryNearby provides a directory of plant nurseries across India. You may use the service to:
• Search and browse nursery listings
• Contact nurseries through their listed information
• Submit reviews and ratings for nurseries you have visited
• List your own nursery business

You agree not to misuse the service, including attempting to access unauthorized areas, scraping data, posting false information, or using the service for any illegal purpose.`,
              },
              {
                title: "3. Nursery Listings",
                body: `Nursery owners who list their business on NurseryNearby agree that:
• All information provided is accurate and up-to-date
• They own or have rights to all photos submitted
• They will update their listing when information changes
• Their business complies with all applicable laws and regulations
• NurseryNearby may verify and moderate listing content

We reserve the right to remove listings that contain false information, inappropriate content, or violate these terms.`,
              },
              {
                title: "4. User Reviews",
                body: `When submitting reviews, you agree to:
• Only review nurseries you have personally visited
• Provide honest and accurate accounts of your experience
• Not submit fake, paid or biased reviews
• Not include personal attacks, hate speech or defamatory content

NurseryNearby reserves the right to remove reviews that violate these guidelines. Nursery owners may not submit reviews for their own businesses.`,
              },
              {
                title: "5. Intellectual Property",
                body: `All content on NurseryNearby, including text, graphics, logos and software, is the property of NurseryNearby or its content suppliers. You may not copy, reproduce, republish or distribute any content without our express written permission. Nursery owners retain ownership of photos they submit but grant NurseryNearby a license to display them on the platform.`,
              },
              {
                title: "6. Disclaimer of Warranties",
                body: `NurseryNearby provides the service "as is" without any warranties. We do not guarantee the accuracy, completeness or reliability of nursery listings. We are not responsible for the quality of products or services provided by listed nurseries. Always verify nursery information directly before visiting.`,
              },
              {
                title: "7. Limitation of Liability",
                body: `To the fullest extent permitted by law, NurseryNearby shall not be liable for any indirect, incidental, special or consequential damages arising from your use of the service. This includes damages from incorrect nursery information, failed transactions with nurseries or any other content on the platform.`,
              },
              {
                title: "8. Third-Party Links",
                body: `Our service may contain links to third-party websites. These links are provided for your convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.`,
              },
              {
                title: "9. Governing Law",
                body: `These Terms of Use shall be governed by the laws of India. Any disputes arising from the use of NurseryNearby shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.`,
              },
              {
                title: "10. Contact",
                body: `For questions about these Terms of Use, please contact us at:
Email: legal@nurserynearby.in
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
