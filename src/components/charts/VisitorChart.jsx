import { useMemo } from "react";
import "./VisitorChart.css";

const VisitorChart = ({ chartData = [] }) => {
  const dayOrder = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  const sortedChartData = useMemo(() => {
    return [...chartData].sort(
      (a, b) => dayOrder.indexOf(a.label) - dayOrder.indexOf(b.label)
    );
  }, [chartData]);

  // ===============================
  // CEK DATA KOSONG
  // ===============================
  const isEmptyData = useMemo(() => {
    return (
      sortedChartData.length > 0 &&
      sortedChartData.every((d) => d.tamu === 0 && d.pinjam === 0)
    );
  }, [sortedChartData]);

  // ===============================
  // HITUNG NILAI MAKS
  // ===============================
  const maxValue = Math.max(
    0,
    ...sortedChartData.flatMap((d) => [d.tamu, d.pinjam])
  );

  let yStep = 10;
  if (maxValue <= 25) yStep = 5;
  else if (maxValue <= 100) yStep = 10;
  else if (maxValue <= 300) yStep = 20;
  else yStep = 50;

  const maxStep = Math.ceil(maxValue / yStep) * yStep;
  const safeMaxStep = maxStep === 0 ? yStep : maxStep;

  const yAxisValues = [];
  for (let i = 0; i <= safeMaxStep; i += yStep) {
    yAxisValues.push(i);
  }

  return (
    <div className="chart-container">
      {/* HEADER */}
      <div className="chart-header-wrapper">
        <h3 className="chart-title">Kunjungan 7 Hari Terakhir</h3>

        <div className="chart-legend">
          <span className="legend-item">
            <div className="chart-legend-box legend-visitor" />
            Tamu
          </span>
          <span className="legend-item">
            <div className="chart-legend-box legend-room" />
            Pinjam Ruangan
          </span>
        </div>
      </div>

      {/* EMPTY STATE */}
      {isEmptyData && (
        <div className="chart-empty-state">Belum ada data minggu ini</div>
      )}

      {/* Y AXIS */}
      <div className="y-axis">
        {yAxisValues.map((val, i) => (
          <div
            key={i}
            className="y-axis-label"
            style={{
              bottom: `${(val / safeMaxStep) * 100}%`,
              transform: "translateY(50%)",
            }}
          >
            {val}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="chart-grid-horizontal">
        {yAxisValues.map((_, i) => (
          <div key={i} className="y-grid-line" />
        ))}
      </div>

      <div className="chart-grid-vertical">
        {sortedChartData.map((_, i) => (
          <div key={i} className="chart-grid-v-line" />
        ))}
      </div>

      {/* BARS */}
      <div className="chart-bars-container">
        {sortedChartData.map((data, index) => (
          <div key={index} className="chart-bar-group">
            <div className="chart-bars-wrapper">
              <div
                className="chart-bar visitor-bar"
                style={{
                  height: `${(data.tamu / safeMaxStep) * 100}%`,
                }}
                data-value={data.tamu}
              />
              <div
                className="chart-bar room-bar"
                style={{
                  height: `${(data.pinjam / safeMaxStep) * 100}%`,
                }}
                data-value={data.pinjam}
              />
            </div>

            <span className="chart-label">{data.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitorChart;
