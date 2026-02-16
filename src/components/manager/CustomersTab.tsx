import type { CustomerSegment, RFMMatrixCell } from "@/types/analysis";
import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import { RFMAnalysis, AdvancedCustomerSegmentation } from "./customers";

interface CustomersTabProps {
  data: PrecomputedData;
}

export function CustomersTab({ data }: CustomersTabProps) {
  const rfmMatrix = data.rfmMatrix as RFMMatrixCell[];
  const frequencySegments = data.frequencySegments as CustomerSegment[];
  const ageSegments = data.ageSegments as CustomerSegment[];
  const genderSegments = data.genderSegments as CustomerSegment[];
  const channelSegments = data.channelSegments as CustomerSegment[];
  const aovSegments = data.aovSegments as CustomerSegment[];
  const lifetimeValueSegments = data.customerSegments;

  return (
    <div className="space-y-8">
      <RFMAnalysis rfmMatrix={rfmMatrix} />
      <AdvancedCustomerSegmentation
        frequencySegments={frequencySegments}
        ageSegments={ageSegments}
        genderSegments={genderSegments}
        channelSegments={channelSegments}
        aovSegments={aovSegments}
        lifetimeValueSegments={lifetimeValueSegments}
      />
    </div>
  );
}
