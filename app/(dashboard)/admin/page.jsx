import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import Transactions from "@/components/transaction";


export default function Page() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6 py-5">
        <ChartAreaInteractive />
      </div>
      <Transactions />
    </>
  );
}
