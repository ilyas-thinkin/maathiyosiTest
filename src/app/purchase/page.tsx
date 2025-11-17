export const dynamic = "force-dynamic";  // disable prerendering
export const revalidate = 0;

import PurchaseClient from "./PurchaseClient";

export default function Page() {
  // this is a server component — safe to export revalidate/dynamic
  return <PurchaseClient />;
}
