import { notFound } from 'next/navigation';
import { MovieDetailView } from '@/src/features/catalog/components/MovieDetailView';
import { getMovieDetailPageData } from '@/src/features/catalog/services/catalog.service';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MovieDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedParams = await searchParams;
  const data = await getMovieDetailPageData(Number(id), resolvedParams);

  if (!data) {
    notFound();
  }

  return <MovieDetailView {...data} />;
}
