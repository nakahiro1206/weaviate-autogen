'use client';
import { TSNEGraph } from '@/components/graph/graph';
import { trpc } from '@/lib/trpc/client';

function GraphPage() {
  return <TSNEGraph />;
}

export default trpc.withTRPC(GraphPage);