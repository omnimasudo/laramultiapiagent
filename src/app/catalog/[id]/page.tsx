// src/app/catalog/[id]/page.tsx
import ClientAPIDetail from './ClientAPIDetail';
import apisData from '../../../../data/apis.json';

export function generateStaticParams() {
  // THIS IS THE FIX: apisData.apis.map
  return apisData.apis.map((api: any) => ({
    id: api.id,
  }));
}

export default async function APIDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientAPIDetail id={id} />;
}