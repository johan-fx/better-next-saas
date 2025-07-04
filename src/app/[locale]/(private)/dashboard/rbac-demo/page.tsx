import { setRequestLocale } from "next-intl/server";
import { RBACDemoView } from "@/modules/rbac/ui/views/rbac-demo-view";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * RBAC Demo Page
 *
 * This page demonstrates the role-based access control system
 * with different permission levels and UI components.
 */
export default async function RBACDemoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RBACDemoView />;
}
