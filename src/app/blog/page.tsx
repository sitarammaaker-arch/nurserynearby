import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { BlogCard } from "@/components/ui/Cards";

export const metadata: Metadata = { title: "Blog — Plant Care Guides & Nursery Tips" };

const POSTS = [
  { id:"1", title:"10 Indoor Plants That Thrive in Indian Apartments", slug:"indoor-plants-indian-apartments", excerpt:"Discover which plants survive low light, monsoon humidity, and busy lifestyles — perfect for city living.", category:"Indoor Plants", coverImage:"https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80", publishedAt:new Date("2025-03-08"), readTime:5 },
  { id:"2", title:"How to Start a Kitchen Garden on a Mumbai Balcony", slug:"kitchen-garden-balcony", excerpt:"From coriander to chillies — a step-by-step guide to edible gardening in compact urban spaces.", category:"Gardening Tips", coverImage:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80", publishedAt:new Date("2025-03-02"), readTime:7 },
  { id:"3", title:"The Complete Guide to Rare & Exotic Plants in India", slug:"rare-exotic-plants-india", excerpt:"Monstera deliciosa, Bird of Paradise, and more — where to find them and how to keep them alive.", category:"Rare Plants", coverImage:"https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80", publishedAt:new Date("2025-02-24"), readTime:8 },
  { id:"4", title:"Best Flowering Plants for Indian Homes in Summer", slug:"flowering-plants-india-summer", excerpt:"Beat the heat with these gorgeous flowering plants that thrive in India's scorching summers.", category:"Flower Plants", coverImage:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", publishedAt:new Date("2025-02-16"), readTime:6 },
  { id:"5", title:"How to Choose the Right Soil Mix for Your Plants", slug:"right-soil-mix-plants", excerpt:"A good soil mix is the foundation of healthy plants. Here's what every Indian plant parent should know.", category:"Plant Care", coverImage:"https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80", publishedAt:new Date("2025-02-08"), readTime:4 },
  { id:"6", title:"5 Succulents That Survive Delhi Winters", slug:"succulents-delhi-winters", excerpt:"These tough little plants can handle Delhi's foggy winters and still look beautiful on your windowsill.", category:"Succulents", coverImage:"https://images.unsplash.com/photo-1552353617-3bfd679b3bdd?w=600&q=80", publishedAt:new Date("2025-01-30"), readTime:5 },
];

export default function BlogPage() {
  return (
    <>
      <Navbar/>
      <main>
        <section className="gradient-sage py-14 border-b border-gray-100">
          <div className="container text-center">
            <span className="badge badge-green mb-4">Plant Knowledge Hub</span>
            <h1 className="font-display text-5xl font-bold text-forest-900 mb-4">NurseryNearby Blog</h1>
            <p className="body-lg max-w-xl mx-auto">Expert plant care guides, nursery tips, and gardening inspiration for Indian plant lovers.</p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {POSTS.map((p) => <BlogCard key={p.id} {...p}/>)}
            </div>
          </div>
        </section>
      </main>
      <Footer/>
    </>
  );
}
