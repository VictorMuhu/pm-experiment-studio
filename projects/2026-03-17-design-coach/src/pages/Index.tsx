import { UtilityBar } from '@/components/UtilityBar';
import { FlowCanvas } from '@/components/FlowCanvas';
import { InspectorPanel } from '@/components/InspectorPanel';
import { MiniMap } from '@/components/MiniMap';

const Index = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <UtilityBar />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative overflow-auto">
          <FlowCanvas />
          <MiniMap />
        </div>
        <InspectorPanel />
      </div>
    </div>
  );
};

export default Index;
