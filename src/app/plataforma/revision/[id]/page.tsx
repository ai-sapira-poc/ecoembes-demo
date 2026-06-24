import { RevisionTicketFullDetail } from "@/components/revision/RevisionTicketFullDetail";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function RevisionTicketPage({ params }: PageProps) {
  const { id } = await params;

  return <RevisionTicketFullDetail id={id} />;
}
