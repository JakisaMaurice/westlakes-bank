import {
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  CreditCard,
  Globe2,
  Headphones,
  Landmark,
  LineChart,
  LockKeyhole,
  PiggyBank,
  Send,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from "lucide-react"

export interface NavLink {
  label: string
  href: string
}

export interface FeatureItem {
  title: string
  description: string
  icon: LucideIcon
}

export interface ServiceItem extends FeatureItem {
  eyebrow: string
}

export const brand = {
  name: "Westlakes Bank",
  email: "hello@westlakes.bank",
  phone: "+1 (212) 555-0184",
  address: "75 Rockefeller Plaza, New York, NY 10019",
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Careers", href: "/careers" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
]

export const serviceItems: ServiceItem[] = [
  {
    eyebrow: "Everyday",
    title: "Personal Banking",
    description: "Premium checking, savings, cards, and support for confident day-to-day money movement.",
    icon: WalletCards,
  },
  {
    eyebrow: "Growth",
    title: "Business Banking",
    description: "Operating accounts, treasury tools, payment rails, and guidance for growing companies.",
    icon: BriefcaseBusiness,
  },
  {
    eyebrow: "Capital",
    title: "Loans",
    description: "Transparent personal, mortgage, vehicle, and business lending shaped around your plans.",
    icon: CircleDollarSign,
  },
  {
    eyebrow: "Future",
    title: "Savings",
    description: "Goal-based savings products with clear visibility, flexible access, and meaningful returns.",
    icon: PiggyBank,
  },
  {
    eyebrow: "Wealth",
    title: "Investments",
    description: "Managed portfolios and advisory conversations for long-term financial momentum.",
    icon: LineChart,
  },
]

export const whyChooseItems: FeatureItem[] = [
  {
    title: "Secure banking",
    description: "Layered encryption, account alerts, and fraud monitoring protect every interaction.",
    icon: ShieldCheck,
  },
  {
    title: "Fast transfers",
    description: "Move money between people, bills, and businesses with speed and transparent tracking.",
    icon: Send,
  },
  {
    title: "24/7 support",
    description: "Human support and digital help are available whenever your financial life needs attention.",
    icon: Headphones,
  },
  {
    title: "Digital access",
    description: "Manage balances, cards, savings goals, and statements from any modern device.",
    icon: Globe2,
  },
]

export const stats = [
  { value: "$4.8B", label: "Assets protected" },
  { value: "320K+", label: "Customers served" },
  { value: "98%", label: "Digital task completion" },
  { value: "24/7", label: "Support coverage" },
]

export const testimonials = [
  {
    quote: "Westlakes gave our finance team the calm, polished banking experience we wanted as we scaled.",
    name: "Maya Bennett",
    role: "Founder, Northline Studio",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80",
  },
  {
    quote: "The mobile experience is quick, clear, and secure. It feels like a private banking desk in my pocket.",
    name: "Ethan Brooks",
    role: "Westlakes personal client",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=80",
  },
  {
    quote: "Their advisors helped us modernize cash flow without losing the personal service we value.",
    name: "Sophia Allen",
    role: "COO, Harbor & Finch",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80",
  },
]

export const digitalFeatures: FeatureItem[] = [
  {
    title: "Card control",
    description: "Freeze, replace, and monitor cards from the mobile experience.",
    icon: CreditCard,
  },
  {
    title: "Secure sign-in",
    description: "Modern identity protection keeps account access guarded.",
    icon: LockKeyhole,
  },
  {
    title: "Goal tracking",
    description: "Watch savings targets and upcoming commitments in one clean view.",
    icon: TrendingUp,
  },
]

export const companyValues: FeatureItem[] = [
  {
    title: "Modern trust",
    description: "We pair rigorous banking controls with an experience that feels simple and human.",
    icon: BadgeCheck,
  },
  {
    title: "Clear advice",
    description: "Our teams explain options plainly so customers can make confident decisions.",
    icon: Landmark,
  },
  {
    title: "Community growth",
    description: "We back households, entrepreneurs, and employers building durable local prosperity.",
    icon: Building2,
  },
  {
    title: "Digital craft",
    description: "Every product is designed for speed, clarity, accessibility, and daily usefulness.",
    icon: Smartphone,
  },
]

export const careerRoles = [
  {
    title: "Relationship Banker",
    location: "Chicago, IL",
    type: "Full time",
    description: "Guide personal and small business customers through premium account and lending needs.",
  },
  {
    title: "Digital Product Designer",
    location: "Hybrid",
    type: "Full time",
    description: "Shape elegant public and self-service banking experiences with research-backed design.",
  },
  {
    title: "Risk Operations Analyst",
    location: "Remote US",
    type: "Full time",
    description: "Strengthen account safety, fraud controls, and operational excellence across bank products.",
  },
]

export const footerServiceLinks: NavLink[] = [
  { label: "Personal Banking", href: "/services" },
  { label: "Business Banking", href: "/services" },
  { label: "Loans", href: "/services" },
  { label: "Savings", href: "/services" },
  { label: "Investments", href: "/services" },
]

export const contactCards: FeatureItem[] = [
  {
    title: "Head office",
    description: brand.address,
    icon: Landmark,
  },
  {
    title: "Client support",
    description: brand.phone,
    icon: Headphones,
  },
  {
    title: "New accounts",
    description: brand.email,
    icon: Banknote,
  },
]
