import { BrowseView } from '@/src/features/catalog/components/BrowseView';
import { getBrowsePageData } from '@/src/features/catalog/services/catalog.service';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BrowsePage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const data = await getBrowsePageData(resolvedParams);

  return <BrowseView {...data} />;
}
