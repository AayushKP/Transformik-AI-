import { supabase } from "@/utils/supabase";
import { ToolCard } from "@/components/tools/ToolCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { SearchBar } from "@/components/layout/SearchBar";
import { getPublicImageUrl } from "@/utils/getPublicImageUrl";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transformik AI - Discover 10,000+ AI Tools | AI Tools Hub",
  description:
    "Discover the latest AI tools, chatbots, writing assistants, and coding tools. Browse 10,000+ AI tools across all categories with reviews and insights.",
  alternates: {
    canonical: "https://www.transformik.com",
  },
  openGraph: {
    title: "Transformik AI - Discover 10,000+ AI Tools",
    description:
      "Discover the latest AI tools, chatbots, writing assistants, and coding tools. Browse 10,000+ AI tools across all categories with reviews and insights.",
    url: "https://www.transformik.com",
  },
};

// ---------- Types ----------
type PricingModel = "Free" | "Freemium" | "Paid" | "Free Trial";

interface Tool {
  id: string;
  tool_name: string;
  slug: string;
  one_line_description: string;
  pricing_model?: PricingModel;
  url: string;
  logo?: string;
  category?: string;
}

interface RawTool {
  id: string;
  tool_name: string;
  slug: string;
  one_line_description: string;
  pricing_model?: PricingModel;
  url: string;
  logo?: string | null;
  category?: string | null;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image?: string;
  featured_image?: string;
  author?: string;
}

// ---------- Data Fetchers ----------
async function getLatestTools(): Promise<Tool[]> {
  const { data, error } = await supabase
    .from("tools_summary")
    .select(
      "id, tool_name, slug, one_line_description, pricing_model, url, logo, category"
    )
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Error fetching latest tools:", error.message);
    return [];
  }

  return (
    data?.map(
      (tool: RawTool): Tool => ({
        ...tool,
        logo: getPublicImageUrl(
          "Images",
          tool.logo ? `ToolLogos/${tool.logo}` : undefined
        ),
        category: tool.category ?? undefined,
      })
    ) ?? []
  );
}

async function getBlogs(): Promise<Blog[]> {
  const { data, error } = await supabase
    .from("blogs_summary")
    .select("id, title, slug, excerpt, featured_image")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching blogs:", error.message);
    return [];
  }

  return data ?? [];
}

// ---------- Helpers ----------
function generateSlug(category: string) {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// ---------- Page ----------
export default async function HomePage() {
  const [latestTools, blogs] = await Promise.all([
    getLatestTools(),
    getBlogs(),
  ]);

  return (
    <main className="space-y-16">
      {/* Search Bar */} <SearchBar />
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-16">
        {/* Featured + Latest Tools */}
        <section
          aria-labelledby="tools-section"
          className="grid grid-cols-1 md:grid-cols-10 gap-6"
        >
          <div className="md:col-span-3 space-y-4">
            <h2 className="text-xl font-bold">Top AI Categories</h2>
            <div className="space-y-2">
              {[
                "AI Chatbots",
                "AI Agents",
                "AI Writing Assistants",
                "AI Coding Assistants",
                "AI Tools for Marketers",
              ].map((category) => {
                const slug = generateSlug(category);
                return (
                  <Link
                    key={category}
                    href={`/tools/category/${slug}`}
                    className="block p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <span className="text-gray-800 font-medium">
                      {category}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <h2 className="text-2xl font-bold">Latest Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {latestTools.length > 0 ? (
                latestTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))
              ) : (
                <p className="text-gray-500">No latest tools available.</p>
              )}
            </div>
          </div>
        </section>

        {/* Blogs Section */}
        <section aria-labelledby="blogs-section" className="space-y-4">
          <div className="text-center space-y-2">
            <h2 id="blogs-section" className="text-2xl font-bold">
              Explore AI Insights
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest insights, tutorials, and trends in AI
              tools and technology.
            </p>
          </div>

          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
              <div className="md:col-span-6 space-y-4">
                <h3 className="text-xl font-semibold">Latest in AI</h3>
                {blogs.slice(0, 2).map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
                <div className="pt-4">
                  <Link
                    href="/blog"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                  >
                    View All Blogs →
                  </Link>
                </div>
              </div>
              <div className="md:col-span-4 space-y-4">
                <h3 className="text-xl font-semibold">More Stories</h3>
                {blogs.slice(2).map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No blogs available.</p>
          )}
        </section>
      </div>
    </main>
  );
}
