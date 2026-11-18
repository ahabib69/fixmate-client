import { ServiceDetails } from "@/components/services/ServiceDetails";
export const metadata = { title: "Service Details | FixMate" };
export default async function ServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ServiceDetails id={id} />;
}
