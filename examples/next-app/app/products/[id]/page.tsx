import { Schema, Product, BreadcrumbList, Organization } from "@schemasentry/next";

const org = Organization({
  name: "Acme Corp",
  url: "https://acme.com"
});

const product = {
  ...Product({
    name: "Premium Widget",
    description: "The ultimate productivity tool for modern developers. Features AI-powered suggestions, real-time collaboration, and seamless integrations.",
    url: "https://acme.com/products/premium-widget",
    image: "https://acme.com/images/premium-widget.jpg",
    brandName: "Acme Corp",
    sku: "PW-2026-001"
  }),
  offers: {
    "@type": "Offer",
    price: "99.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    validFrom: "2026-01-01"
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "1247"
  }
} as const;

const breadcrumbs = BreadcrumbList({
  items: [
    { name: "Home", url: "https://acme.com" },
    { name: "Products", url: "https://acme.com/products" },
    { name: "Premium Widget", url: "https://acme.com/products/premium-widget" }
  ]
});

export default function ProductPage() {
  return (
    <>
      <Schema data={[org, product, breadcrumbs]} />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "3rem" }}>
          
          {/* Product Image */}
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "1rem",
            aspectRatio: "1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "6rem",
            color: "white"
          }}>
            🛠️
          </div>

          {/* Product Info */}
          <div>
            <div style={{
              display: "inline-block",
              background: "#10b981",
              color: "white",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              marginBottom: "1rem"
            }}>
              BEST SELLER
            </div>
            
            <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Premium Widget
            </h1>
            
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                {"⭐".repeat(5)}
              </div>
              <span style={{ color: "#64748b" }}>4.8 (1,247 reviews)</span>
            </div>

            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#6366f1", marginBottom: "1.5rem" }}>
              $99.00
            </div>

            <p style={{ color: "#64748b", fontSize: "1.125rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              The ultimate productivity tool for modern developers. Features AI-powered suggestions, 
              real-time collaboration, and seamless integrations with your favorite tools.
            </p>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                border: "none",
                padding: "1rem 2rem",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer"
              }}>
                Add to Cart
              </button>
              <button style={{
                background: "white",
                color: "#1a1a1a",
                border: "1px solid #e5e5e5",
                padding: "1rem 2rem",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer"
              }}>
                ♡ Wishlist
              </button>
            </div>

            {/* Features */}
            <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #e5e5e5" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Features:</h3>
              <ul style={{ paddingLeft: "1.25rem", color: "#64748b" }}>
                <li>AI-powered code suggestions</li>
                <li>Real-time collaboration</li>
                <li>50+ integrations</li>
                <li>Offline support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section style={{
          background: "white",
          borderRadius: "1rem",
          padding: "2rem",
          border: "1px solid #e5e5e5"
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Customer Reviews</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <Review
              name="Sarah Chen"
              rating={5}
              date="February 8, 2026"
              content="Absolutely amazing! This tool has completely transformed our team's workflow. The AI suggestions are incredibly accurate."
            />
            <Review
              name="Mike Johnson"
              rating={5}
              date="February 5, 2026"
              content="Best developer tool I've used in years. The real-time collaboration feature is a game-changer for remote teams."
            />
            <Review
              name="Emily Davis"
              rating={4}
              date="January 28, 2026"
              content="Great product with excellent support. Would love to see more integrations in the future."
            />
          </div>
        </section>

      </div>
    </>
  );
}

function Review({ name, rating, date, content }: { name: string; rating: number; date: string; content: string }) {
  return (
    <div style={{ paddingBottom: "1.5rem", borderBottom: "1px solid #f3f4f6" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <span style={{ color: "#10b981", fontSize: "0.75rem" }}>✓ Verified</span>
        </div>
        <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>{date}</span>
      </div>
      <div style={{ color: "#f59e0b", marginBottom: "0.5rem" }}>
        {"⭐".repeat(rating)}
      </div>
      <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6 }}>{content}</p>
    </div>
  );
}
