"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SearchParamsWrapper({
  setIsDetailView,
}: {
  setIsDetailView: (value: boolean) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsDetailView(searchParams.size > 0);
  }, [searchParams, setIsDetailView]);

  return null;
}
