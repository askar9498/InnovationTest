import React, { useEffect, useRef } from "react";
import ApexCharts, { ApexOptions } from "apexcharts";
import { KTIcon } from "../../../helpers";
import { getCSSVariableValue } from "../../../assets/ts/_utils";
import { Dropdown1 } from "../../content/dropdown/Dropdown1";
import { useThemeMode } from "../../layout/theme-mode/ThemeModeProvider";

type Props = {
  className: string;
  chartColor: string;
  chartHeight: string;
};

const MixedWidget7: React.FC<Props> = ({
  className,
  chartColor,
  chartHeight,
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const { mode } = useThemeMode();
  const refreshChart = () => {
    if (!chartRef.current) {
      return;
    }

    const chart = new ApexCharts(
      chartRef.current,
      chartOptions(chartColor, chartHeight)
    );
    if (chart) {
      chart.render();
    }

    return chart;
  };

  useEffect(() => {
    const chart = refreshChart();

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRef, mode]);

  return (
    <div className={`${className}`} dir="rtl" style={{ fontFamily: "sans" }}>
      {/* begin::Body */}
      <div className="card-body d-flex flex-column">
        <div className="flex-grow-1">
          <div ref={chartRef} className="mixed-widget-4-chart"></div>
        </div>

        <div className="p-0">
          <p className="text-center fs-6 p-0">
            <span className="badge badge-light-danger fs-8">یادداشت:</span>&nbsp;
            اسپرینت فعلی نیاز به تایید ذینفعان
            <br />
            برای سیاست‌های اصلاح شده جدید دارد
          </p>
        </div>
      </div>
      {/* end::Body */}
    </div>
  );
};

const chartOptions = (chartColor: string, chartHeight: string): ApexOptions => {
  const baseColor = getCSSVariableValue("--bs-" + chartColor);
  const lightColor = getCSSVariableValue("--bs-" + chartColor + "-light");
  const labelColor = getCSSVariableValue("--bs-gray-700");

  return {
    series: [74],
    chart: {
      fontFamily: "inherit",
      height: chartHeight,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 0,
          size: "65%",
        },
        dataLabels: {
          name: {
            show: false,
            fontWeight: "700",
          },
          value: {
            color: labelColor,
            fontSize: "30px",
            fontWeight: "700",
            offsetY: 12,
            show: true,
            formatter: function (val) {
              return val + "%";
            },
          },
        },
        track: {
          background: lightColor,
          strokeWidth: "100%",
        },
      },
    },
    colors: [baseColor],
    stroke: {
      lineCap: "round",
    },
    labels: ["پیشرفت"],
  };
};

export { MixedWidget7 };
