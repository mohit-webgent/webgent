import type { FeatureStatus } from "@/data/pricing-matrix-data";
import type { PricingFlowMode } from "./use-pricing-configurator";
import {
  Check,
  Plus,
  Shield,
  Zap,
  Building2,
  ShoppingBag,
  User,
  Sparkles,
  Layers,
  CreditCard,
  MessageCircle,
  Calendar,
  Lock,
  LayoutDashboard,
  BookOpen,
  Mail,
  Search,
  Globe,
  Bot,
  CheckCircle2,
  Database,
  Info,
  Package,
  Wrench,
} from "lucide-react";

export function renderCategoryIcon(iconName: string, className = "w-4 h-4") {
  switch (iconName) {
    case "Layout":
      return <LayoutDashboard className={className} />;
    case "BookOpen":
      return <BookOpen className={className} />;
    case "ShoppingBag":
      return <ShoppingBag className={className} />;
    case "Lock":
      return <Lock className={className} />;
    case "LayoutDashboard":
      return <LayoutDashboard className={className} />;
    case "Database":
      return <Database className={className} />;
    case "CreditCard":
      return <CreditCard className={className} />;
    case "MessageCircle":
      return <MessageCircle className={className} />;
    case "Mail":
      return <Mail className={className} />;
    case "Calendar":
      return <Calendar className={className} />;
    case "User":
      return <User className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Layers":
      return <Layers className={className} />;
    case "Search":
      return <Search className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Shield":
      return <Shield className={className} />;
    case "Globe":
      return <Globe className={className} />;
    case "CheckCircle2":
      return <CheckCircle2 className={className} />;
    case "Bot":
      return <Bot className={className} />;
    case "Building2":
      return <Building2 className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}
// Status Badge Renderer for Matrix Row
export function renderStatusBadge(status: FeatureStatus, note?: string) {
  switch (status) {
    case "included":
      return (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-accent text-xs sm:text-xs font-mono font-semibold whitespace-nowrap"
          title={note || "Included in package base"}
        >
          <Check className="w-3 h-3 text-accent stroke-[3]" />
          <span className="hidden sm:inline">Included</span>
        </span>
      );
    case "limited":
      return (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-xs font-mono font-medium whitespace-nowrap"
          title={note || "Included with scope limitation"}
        >
          <Info className="w-3 h-3 text-amber-400" />
          <span className="truncate max-w-[80px]">{note || "Limited"}</span>
        </span>
      );
    case "addon":
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/10 border border-accent/25 text-accent text-xs sm:text-xs font-mono whitespace-nowrap">
          <Plus className="w-3 h-3 text-accent" />
          <span className="hidden sm:inline">Add-on</span>
        </span>
      );
    case "custom_quote":
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-accent text-xs sm:text-xs font-mono whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-accent" />
          <span className="hidden sm:inline">Quote</span>
        </span>
      );
    case "not_included":
    default:
      return (
        <span className="text-fg-muted text-xs font-mono select-none px-1.5 py-0.5" title="Not available in this tier">
          —
        </span>
      );
  }
}
// ---------------------------------------------------------------------------
// Flow Mode Descriptions
// ---------------------------------------------------------------------------
export const flowOptions: { mode: PricingFlowMode; icon: React.ReactNode; title: string; subtitle: string }[] = [
  {
    mode: "package",
    icon: <Package className="w-5 h-5" />,
    title: "Package + Extra Features",
    subtitle: "Start with a curated base package, then review and customize with add-ons",
  },
  {
    mode: "custom_only",
    icon: <Wrench className="w-5 h-5" />,
    title: "Fully Custom Build",
    subtitle: "Skip base packages — handpick every individual feature from scratch",
  },
];

// Feature matrix is always visible so users can review, explore, and add features
