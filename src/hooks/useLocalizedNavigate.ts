"use client";
import { useRouter } from "@/i18n/navigation";

export function useLocalizedNavigate() {
  const router = useRouter();
  return (to: string | number, options?: Parameters<typeof router.push>[1]) => {
    if (typeof to === "number") {
      router.back();
      return;
    }
    router.push(to, options);
  };
}
