'use client';

export default function ColorDemo() {
  const colorGroups = [
    {
      title: "Primary Colors - Deep Ocean Blue",
      description: "Conveys trust, cleanliness, and professionalism",
      colors: [
        { name: "Primary", class: "bg-primary", hex: "#0f172a" },
        { name: "Primary Light", class: "bg-primary-light", hex: "#1e293b" },
        { name: "Primary Soft", class: "bg-primary-soft", hex: "#334155" },
      ]
    },
    {
      title: "Secondary Colors - Warm Copper",
      description: "Adds luxury, warmth, and premium feel",
      colors: [
        { name: "Secondary", class: "bg-secondary", hex: "#9a3412" },
        { name: "Secondary Light", class: "bg-secondary-light", hex: "#c2410c" },
        { name: "Accent", class: "bg-accent", hex: "#ea580c" },
      ]
    },
    {
      title: "Neutral Colors",
      description: "Clean, modern foundation for content",
      colors: [
        { name: "Neutral 50", class: "bg-neutral-50", hex: "#f8fafc" },
        { name: "Neutral 100", class: "bg-neutral-100", hex: "#f1f5f9" },
        { name: "Neutral 200", class: "bg-neutral-200", hex: "#e2e8f0" },
        { name: "Neutral 300", class: "bg-neutral-300", hex: "#cbd5e1" },
        { name: "Neutral 400", class: "bg-neutral-400", hex: "#94a3b8" },
        { name: "Neutral 500", class: "bg-neutral-500", hex: "#64748b" },
        { name: "Neutral 600", class: "bg-neutral-600", hex: "#475569" },
        { name: "Neutral 700", class: "bg-neutral-700", hex: "#334155" },
        { name: "Neutral 800", class: "bg-neutral-800", hex: "#1e293b" },
        { name: "Neutral 900", class: "bg-neutral-900", hex: "#0f172a" },
      ]
    },
    {
      title: "Semantic Colors",
      description: "Status and feedback colors",
      colors: [
        { name: "Success", class: "bg-success", hex: "#16a34a" },
        { name: "Warning", class: "bg-warning", hex: "#d97706" },
        { name: "Error", class: "bg-error", hex: "#dc2626" },
        { name: "Info", class: "bg-info", hex: "#2563eb" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Professional Color Palette
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            A sophisticated color scheme designed for luxury bathroom products, 
            combining trust-building blues with warm copper accents for a premium feel.
          </p>
        </div>

        <div className="space-y-12">
          {colorGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-surface-elevated rounded-xl p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">{group.title}</h2>
                <p className="text-text-muted">{group.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {group.colors.map((color, colorIndex) => (
                  <div key={colorIndex} className="text-center">
                    <div 
                      className={`${color.class} w-full h-20 rounded-lg mb-3 shadow-md border border-neutral-200`}
                    />
                    <div className="text-sm">
                      <div className="font-medium text-text">{color.name}</div>
                      <div className="text-text-muted font-mono text-xs">{color.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Usage Examples */}
        <div className="mt-16 bg-surface-elevated rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-primary mb-6">Usage Examples</h2>
          
          <div className="space-y-8">
            {/* Header Example */}
            <div className="bg-primary text-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Premium Shower Solutions</h3>
              <p className="text-neutral-200">Transform your bathroom with our luxury shower cabins</p>
            </div>

            {/* Button Examples */}
            <div className="flex flex-wrap gap-4">
              <button className="bg-accent hover:bg-secondary-light text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Shop Now
              </button>
              <button className="bg-neutral-100 hover:bg-neutral-200 text-primary px-6 py-3 rounded-lg font-medium transition-colors">
                Learn More
              </button>
              <button className="border-2 border-accent text-accent hover:bg-accent hover:text-white px-6 py-3 rounded-lg font-medium transition-colors">
                View Catalog
              </button>
            </div>

            {/* Card Example */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-primary mb-2">Modern Shower Enclosure</h4>
              <p className="text-text-secondary mb-4">Sleek, modern, and easy to install. Perfect for any bathroom.</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-accent">$499</span>
                <button className="bg-accent text-white px-4 py-2 rounded font-medium">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
