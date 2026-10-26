export const ADVERTISE_INTRO = {
  eyebrow: "Business Advertising",
  title: "Business Advertising",
  subtitle: "Get your business in front of more customers with premium placement across our directory.",
};

export const PACKAGE_COPY: Record<
  string,
  {
    tagline: string;
    features: string[];
  }
> = {
  featured: {
    tagline: "Get noticed with enhanced placement in the directory.",
    features: [
      "Featured section placement",
      "Highlighted business card",
      "“Featured” ribbon/badge",
      "Increased visibility compared to standard listings",
    ],
  },
  sponsored: {
    tagline: "Put your business front and center with premium sponsored placement.",
    features: [
      "Front-page sponsorship placement",
      "Featured section placement",
      "Prominent “Sponsored” labeling",
      "Priority visibility above organic listings",
    ],
  },
  "homepage-featured": {
    tagline: "Give your business premium exposure on the homepage.",
    features: [
      "Prominent homepage placement",
      "Main sidebar banner advertisement",
      "Premium placement separate from standard featured listings",
      "High-visibility exposure to homepage visitors",
    ],
  },
  "exclusive-city-sponsor": {
    tagline: "Own the spotlight in your city with our highest-level advertising package.",
    features: [
      "Front-page placement",
      "Featured section placement",
      "Main homepage hero advertisement",
      "Exclusive city sponsorship positioning",
      "Maximum visibility across the directory",
    ],
  },
};
