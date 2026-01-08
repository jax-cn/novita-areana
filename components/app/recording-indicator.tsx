interface RecordingIndicatorProps {
  duration: string;
}

export function RecordingIndicator({ duration }: RecordingIndicatorProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
        <div className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">
          Recording
        </span>
      </div>
      <span className="text-2xl font-bold tabular-nums tracking-tight">
        {duration}
      </span>
    </div>
  );
}
