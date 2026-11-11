import { HomeView } from '@/src/features/home/components/HomeView';
import { getHomePageData } from '@/src/features/home/services/home.service';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const data = await getHomePageData(resolvedParams);

  return <HomeView {...data} />;
}
