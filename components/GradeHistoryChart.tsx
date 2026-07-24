import type { Grade } from '@/lib/grades';

const WIDTH = 600;
const HEIGHT = 220;
const PADDING = { top: 16, right: 44, bottom: 28, left: 32 };
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;
const Y_TICKS = [0, 50, 100];

function yFor(score: number): number {
  return PADDING.top + PLOT_HEIGHT - (score / 100) * PLOT_HEIGHT;
}

function formatDate(iso: string): string {
  const [, month, day] = iso.split('-');
  return `${month}/${day}`;
}

/** Chart's own table-view companion is GradeHistoryTable, rendered alongside it. */
export function GradeHistoryChart({ grades }: { grades: Grade[] }) {
  const sorted = [...grades].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  const n = sorted.length;

  const points = sorted.map((grade, i) => ({
    x: n === 1 ? PADDING.left + PLOT_WIDTH / 2 : PADDING.left + (i / (n - 1)) * PLOT_WIDTH,
    y: yFor(grade.percentage),
    grade,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(PADDING.top + PLOT_HEIGHT).toFixed(1)} ` +
        `L ${points[0].x.toFixed(1)} ${(PADDING.top + PLOT_HEIGHT).toFixed(1)} Z`
      : '';

  const last = points[points.length - 1];

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Score history</p>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-2 w-full" role="img" aria-label="Grade history line chart">
        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={yFor(tick)}
              y2={yFor(tick)}
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 8}
              y={yFor(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-zinc-400 text-[10px] dark:fill-zinc-500"
            >
              {tick}
            </text>
          </g>
        ))}

        {points.length > 0 && (
          <text
            x={PADDING.left}
            y={HEIGHT - 8}
            textAnchor="start"
            className="fill-zinc-400 text-[10px] dark:fill-zinc-500"
          >
            {formatDate(points[0].grade.recordedAt)}
          </text>
        )}
        {points.length > 1 && (
          <text
            x={WIDTH - PADDING.right}
            y={HEIGHT - 8}
            textAnchor="end"
            className="fill-zinc-400 text-[10px] dark:fill-zinc-500"
          >
            {formatDate(points[points.length - 1].grade.recordedAt)}
          </text>
        )}

        {areaPath && <path d={areaPath} className="fill-[#2a78d6]/10 dark:fill-[#3987e5]/10" />}
        {points.length > 1 && (
          <path
            d={linePath}
            fill="none"
            className="stroke-[#2a78d6] dark:stroke-[#3987e5]"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((p) => (
          <circle
            key={p.grade.id}
            cx={p.x}
            cy={p.y}
            r={4}
            className="fill-[#2a78d6] stroke-white dark:fill-[#3987e5] dark:stroke-zinc-950"
            strokeWidth={2}
          >
            {/* <desc>, not <title> - React hoists any <title> tag to <head> as document metadata,
                even one nested inside an SVG, which breaks hydration and drops the tooltip. */}
            <desc>
              {p.grade.recordedAt}: {p.grade.pointsEarned}/{p.grade.pointsPossible} ({Math.round(p.grade.percentage)}%)
              {p.grade.label ? ` (${p.grade.label})` : ''}
            </desc>
          </circle>
        ))}

        {last && (
          <text
            x={last.x + 8}
            y={last.y}
            dominantBaseline="middle"
            className="fill-zinc-700 text-xs font-medium dark:fill-zinc-300"
          >
            {Math.round(last.grade.percentage)}%
          </text>
        )}
      </svg>
    </div>
  );
}
