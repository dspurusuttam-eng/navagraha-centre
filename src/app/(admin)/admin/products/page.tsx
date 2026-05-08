import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { updateProductAction } from "@/modules/admin/actions";
import {
  formatAdminCurrency,
  formatAdminDateTime,
} from "@/modules/admin/format";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { listAdminProducts } from "@/modules/admin/service";
import { requireAdminSession } from "@/modules/auth/server";

const productStatusOptions = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

export const metadata = buildAdminMetadata({
  title: "Admin Products",
  description:
    "Manage product visibility, featured merchandising, and catalog state for the NAVAGRAHA CENTRE shop foundation.",
  path: "/admin/products",
  keywords: ["product catalog admin", "shop merchandising", "internal catalog"],
});

export default async function AdminProductsPage() {
  await requireAdminSession({
    allowedRoles: ["founder"],
  });

  const products = await listAdminProducts();

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Products"
        title="Catalog visibility and merchandising can be adjusted without touching the public build."
        description="The product layer stays deliberately simple here: status, featured placement, and a quick read on connected remedy and order usage."
      />

      <Card className="space-y-5">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Catalog State</th>
                <th className="px-3 py-2">Connections</th>
                <th className="px-3 py-2">Controls</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="rounded-l-[var(--radius-xl)] border border-r-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                          {product.name}
                        </p>
                        <AdminStatusBadge status={product.status} />
                        {product.isFeatured ? (
                          <AdminStatusBadge status="FEATURED" />
                        ) : null}
                      </div>
                      <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        {product.slug}
                      </p>
                      <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        {product.category} • {product.type}
                      </p>
                    </div>
                  </td>

                  <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                    <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      <p>
                        Price:{" "}
                        <span className="text-[color:var(--color-foreground)]">
                          {formatAdminCurrency(
                            product.priceInMinor,
                            product.currencyCode
                          )}
                        </span>
                      </p>
                      <p>
                        Inventory:{" "}
                        <span className="text-[color:var(--color-foreground)]">
                          {product.inventoryCount ?? "Flexible"}
                        </span>
                      </p>
                      <p>
                        Updated:{" "}
                        <span className="text-[color:var(--color-foreground)]">
                          {formatAdminDateTime(product.updatedAt)}
                        </span>
                      </p>
                    </div>
                  </td>

                  <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                    <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      <p>
                        Remedy links:{" "}
                        <span className="text-[color:var(--color-foreground)]">
                          {product._count.remedyLinks}
                        </span>
                      </p>
                      <p>
                        Order lines:{" "}
                        <span className="text-[color:var(--color-foreground)]">
                          {product._count.orderItems}
                        </span>
                      </p>
                      <p>
                        Sort order:{" "}
                        <span className="text-[color:var(--color-foreground)]">
                          {product.sortOrder}
                        </span>
                      </p>
                    </div>
                  </td>

                  <td className="rounded-r-[var(--radius-xl)] border border-l-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                    <form action={updateProductAction} className="space-y-3">
                      <input
                        type="hidden"
                        name="productId"
                        value={product.id}
                      />
                      <label className="block space-y-2">
                        <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                          Status
                        </span>
                        <Select name="status" defaultValue={product.status}>
                          {productStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                      </label>
                      <label className="flex items-center gap-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                        <input
                          className="h-4 w-4 rounded border border-[color:var(--color-border-strong)] bg-transparent accent-[color:var(--color-accent)]"
                          type="checkbox"
                          name="isFeatured"
                          defaultChecked={product.isFeatured}
                        />
                        Keep featured in merchandising surfaces
                      </label>
                      <Button size="sm" type="submit">
                        Save Product
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
