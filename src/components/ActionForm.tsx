"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/actions/coffees";

interface ActionFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  id: string;
  onSuccess?: (result: Extract<ActionResult, { ok: true }>) => void;
  className?: string;
  children: React.ReactNode;
}

// A plain <form action> drops what the server action returns, so failures were silent.
// This shows the error as a toast and lets the caller react to success.
export default function ActionForm({
  action,
  id,
  onSuccess,
  className,
  children,
}: ActionFormProps) {
  const [, formAction] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if ("error" in result) toast.error(result.error);
      else onSuccess?.(result);
      return result;
    },
    null
  );

  return (
    <form action={formAction} className={className}>
      <input type="hidden" name="id" value={id} />
      {children}
    </form>
  );
}
