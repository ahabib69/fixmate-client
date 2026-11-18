import { ServiceForm } from "@/components/dashboard/ServiceForm";
import { PageHeading } from "@/components/dashboard/Shared";
export default function Page() {
  return (
    <>
      <PageHeading
        title="Add a service"
        description="Tell customers what you repair and where you work."
      />
      <div className="max-w-3xl rounded-xl border bg-card p-6">
        <ServiceForm />
      </div>
    </>
  );
}
