"use client";

import ErrorPage, { ErrorPageI } from "@/components/Pages/Error/ErrorPage";
import { useParams } from "next/navigation";

export default function ExplorerError(props: ErrorPageI) {
  const { resource_id } = useParams<{ resource_id: string }>();

  return <ErrorPage {...props} context={`[Explorer] resource_id=${resource_id}`} />;
}
