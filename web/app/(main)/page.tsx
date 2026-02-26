import { MOCK_ROUTES, MOCK_AREAS } from "@/app/lib/mock-data";
import { getDBRoutes } from "@/app/lib/routes";
import HomeFeed from "./home-feed";

export default async function HomePage() {
  const dbRoutes = await getDBRoutes();

  const allRoutes = [...dbRoutes, ...MOCK_ROUTES];

  return <HomeFeed routes={allRoutes} areas={MOCK_AREAS} />;
}
