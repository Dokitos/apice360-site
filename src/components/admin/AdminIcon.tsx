import {
  Archive, AtSign, ArrowLeftRight, BadgeCheck, Bold, Braces, Code, FileDown,
  Heading2, Heading3, Inbox, Italic, Link2, List, ListOrdered, MailOpen, Palette,
  Sparkles, Star, Strikethrough, Table2, Underline, Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bell, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  CircleHelp, ClipboardList, ExternalLink, Eye, FilePlus2, FileText, Folder,
  GripVertical, Handshake, Image, LayoutDashboard, LayoutPanelTop, LogOut,
  Mail, MailCheck, Megaphone, Menu, MessageCircle, MessageSquare, MousePointer2,
  Paperclip, Pencil, Phone, Plus, Quote, RefreshCw, Search, Send, Settings2,
  ShieldCheck, ShieldX, Tag, Target, Trash2, TrendingUp, TriangleAlert,
  Users, UserRoundCog, Video, Wrench, X, XCircle, type LucideIcon,
} from "lucide-react";
import { Icon as ContentIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

// Keep the names used by existing admin screens; only their visual rendering changes.
const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard, contact_mail: Users, mail: Mail,
  dashboard_customize: LayoutPanelTop, note_add: FilePlus2, ads_click: MousePointer2,
  engineering: Wrench, photo_library: Image, handshake: Handshake, format_quote: Quote,
  monitoring: Activity, article: FileText, sell: Tag, forum: MessageSquare,
  bolt: MousePointer2, search: Search, settings: Settings2, manage_accounts: UserRoundCog,
  shield_person: ShieldCheck, menu: Menu, close: X, chevron_left: ChevronLeft,
  chevron_right: ChevronRight, expand_less: ChevronUp, expand_more: ChevronDown,
  open_in_new: ExternalLink, logout: LogOut, add: Plus, edit: Pencil,
  edit_square: Pencil, delete: Trash2, arrow_forward: ArrowRight, arrow_back: ArrowLeft,
  arrow_upward: ArrowUp, arrow_downward: ArrowDown, calendar_today: CalendarDays,
  trending_up: TrendingUp, target: Target, mark_email_read: MailCheck,
  campaign: Megaphone, call: Phone, phone_in_talk: Phone, chat: MessageCircle,
  check: Check, check_circle: CheckCircle2, cancel: XCircle, warning: TriangleAlert,
  gpp_bad: ShieldX, attach_file: Paperclip, description: FileText,
  drag_indicator: GripVertical, forward_to_inbox: Send, refresh: RefreshCw,
  visibility: Eye, movie: Video, notifications: Bell, folder: Folder,
  checklist: ClipboardList, help: CircleHelp, fiber_new: Sparkles, verified: BadgeCheck,
  date_range: CalendarDays, calendar_month: CalendarDays, alternate_email: AtSign,
  inbox: Inbox, send: Send, archive: Archive, mark_email_unread: MailOpen,
  star: Star, star_border: Star, sync_alt: ArrowLeftRight, format_bold: Bold,
  format_italic: Italic, format_underlined: Underline, format_strikethrough: Strikethrough,
  format_h2: Heading2, format_h3: Heading3, format_list_bulleted: List,
  format_list_numbered: ListOrdered, code: Code, data_object: Braces, link: Link2,
  palette: Palette, image: Image, csv: FileDown, table_chart: Table2, picture_as_pdf: FileDown,
};

export function AdminIcon({ name, className, filled = false }: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  const Symbol = icons[name];
  // Content editors may display arbitrary icons selected for public pages.
  if (!Symbol) return <ContentIcon name={name} className={className} filled={filled} />;
  return <Symbol aria-hidden="true" focusable="false" strokeWidth={1.75}
    className={cn("admin-icon", className)} />;
}
