import { notFound } from 'next/navigation';
import { TvDetailView } from '@/src/features/catalog/components/TvDetailView';
import { getTvDetailPageData } from '@/src/features/catalog/services/catalog.service';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TVDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedParams = await searchParams;
  const data = await getTvDetailPageData(Number(id), resolvedParams);

  if (!data) {
    notFound();
  }

  return <TvDetailView {...data} />;
}
