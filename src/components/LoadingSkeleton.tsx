import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="mt-4 space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="mb-4 p-4 rounded-lg">
              <Skeleton className="h-5 w-24 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <Skeleton className="h-9 px-2 py-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
