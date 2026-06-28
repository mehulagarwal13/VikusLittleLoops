import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiMapPin, FiPhone, FiMail, FiFileText } from "react-icons/fi";
import { getOrders, setOrderStatus } from "@/admin/lib/adminApi";
import { PageTitle, Panel, Spinner, EmptyState, StatusPill, Th, Td } from "@/admin/components/AdminUI";

const STATUSES = ["pending", "confirmed", "crafting", "shipped", "delivered", "cancelled"];
const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function Orders() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: getOrders });
  const [openId, setOpenId] = useState(null);

  const setStatus = useMutation({
    mutationFn: ({ id, status }) => setOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  return (
    <>
      <PageTitle title="Orders" subtitle="Click an order to see full customer & item details" />
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <EmptyState emoji="🛍️" text="No orders yet." />
      ) : (
        <Panel className="overflow-hidden p-0">
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr>
                <Th>Order</Th><Th>Customer</Th><Th>Total</Th><Th>Payment</Th><Th>Status</Th><Th>Update</Th><Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((o) => (
                <Row key={o.id} o={o} open={openId === o.id} onToggle={() => setOpenId(openId === o.id ? null : o.id)} setStatus={setStatus} />
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </>
  );
}

function Row({ o, open, onToggle, setStatus }) {
  return (
    <>
      <tr className="cursor-pointer hover:bg-white/5" onClick={onToggle}>
        <Td className="font-medium text-white">{o.order_number}</Td>
        <Td>
          {o.ship_name || "—"}
          <span className="block text-xs text-blush-200/40">{o.ship_city}</span>
        </Td>
        <Td>{inr(o.total)}</Td>
        <Td><StatusPill status={o.payment_status} /></Td>
        <Td><StatusPill status={o.status} /></Td>
        <Td onClick={(e) => e.stopPropagation()}>
          <select
            value={o.status}
            onChange={(e) => setStatus.mutate({ id: o.id, status: e.target.value })}
            className="rounded-lg border border-white/10 bg-[#15101a] px-2.5 py-1.5 text-xs text-white outline-none focus:border-blush-500"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Td>
        <Td className="text-right">
          <FiChevronDown className={`inline transition-transform ${open ? "rotate-180" : ""} text-blush-200/60`} />
        </Td>
      </tr>
      <AnimatePresence>
        {open && (
          <tr>
            <td colSpan={7} className="bg-[#15101a]/60 px-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.3fr_1fr]">
                  {/* Items */}
                  <div>
                    <h4 className="mb-3 text-[0.7rem] uppercase tracking-wider text-blush-200/40">Items</h4>
                    <div className="space-y-2">
                      {o.items.map((it, i) => (
                        <div key={i} className="flex justify-between text-sm text-blush-50">
                          <span>{it.product_name} <span className="text-blush-200/40">× {it.quantity}</span></span>
                          <span>{inr(it.unit_price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-1 border-t border-white/5 pt-3 text-sm">
                      <div className="flex justify-between text-blush-200/60"><span>Subtotal</span><span>{inr(o.subtotal)}</span></div>
                      {Number(o.discount_amount) > 0 && (
                        <div className="flex justify-between text-emerald-300"><span>Discount</span><span>−{inr(o.discount_amount)}</span></div>
                      )}
                      <div className="flex justify-between text-blush-200/60"><span>Shipping</span><span>{Number(o.shipping_amount) > 0 ? inr(o.shipping_amount) : "Free"}</span></div>
                      <div className="flex justify-between pt-1 font-display text-base text-white"><span>Total</span><span>{inr(o.total)}</span></div>
                    </div>
                  </div>

                  {/* Customer & shipping */}
                  <div>
                    <h4 className="mb-3 text-[0.7rem] uppercase tracking-wider text-blush-200/40">Customer & Shipping</h4>
                    <div className="space-y-2.5 text-sm text-blush-50">
                      <p className="font-medium text-white">{o.ship_name || "—"}</p>
                      {o.ship_email && (
                        <a href={`mailto:${o.ship_email}`} className="flex items-center gap-2 text-blush-200/80 hover:text-blush-300">
                          <FiMail size={14} /> {o.ship_email}
                        </a>
                      )}
                      {o.ship_phone && (
                        <a href={`tel:${o.ship_phone}`} className="flex items-center gap-2 text-blush-200/80 hover:text-blush-300">
                          <FiPhone size={14} /> {o.ship_phone}
                        </a>
                      )}
                      <p className="flex items-start gap-2 text-blush-200/80">
                        <FiMapPin size={14} className="mt-0.5 shrink-0" />
                        <span>
                          {o.ship_address || "—"}
                          {(o.ship_city || o.ship_state || o.ship_pincode) && (
                            <span className="block">
                              {[o.ship_city, o.ship_state, o.ship_pincode].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </span>
                      </p>
                      {o.notes && (
                        <p className="flex items-start gap-2 text-blush-200/80">
                          <FiFileText size={14} className="mt-0.5 shrink-0" /> {o.notes}
                        </p>
                      )}
                      <p className="pt-1 text-xs text-blush-200/40">
                        Placed {new Date(o.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
