import { redirect } from "next/navigation";

type SearchPageProps = {
  searchParams: Promise<{
    ticker?: string;
  }>;
};

export default async function MarketSearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const ticker = params.ticker?.trim().toUpperCase();

  if (!ticker) {
    redirect("/market");
  }

  redirect(`/market/${ticker}`);
}