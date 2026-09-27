import Chart from "react-apexcharts";
import PropTypes from "prop-types";
import {
  capitalizeFirstLetter,
  formateAmount,
  safeNumber,
} from "../../../helpers/commonFunctions";

const BudgetChart = ({ spendAmount, maxAmount, currency, period }) => {
  const safeSpendAmount = safeNumber(spendAmount);
  const safeMaxAmount = safeNumber(maxAmount);
  const percentage =
    safeMaxAmount > 0
      ? Math.min(100, Math.max(0, (safeSpendAmount / safeMaxAmount) * 100))
      : 0;

  const options = {
    chart: {
      type: "radialBar",
      offsetY: 0,
    },
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 360,
        hollow: {
          margin: 0,
          size: "65%",
          background: "#fff",
        },
        dataLabels: {
          showOn: "always",
          name: {
            show: true,
            fontSize: "16px",
            fontWeight: 400,
            offsetY: 20,
            color: "#000",
            formatter: () => "",
            // formatter: () => "Monthly",
          },
          value: {
            formatter: () => safeSpendAmount,
            // formatter: (val) => `₹${spendAmount}`,
            color: "#000",
            fontSize: "24px",
            fontWeight: 700,
            show: false,
            offsetY: 40,
            align: "center",
            style: {
              fontFamily: "SF Pro text",
            },
          },
          total: {
            show: true,
            label: `-${(safeMaxAmount / 30).toFixed(2)} per day`,
            color: "#6c757d",
            fontSize: "14px",
            fontWeight: 400,
          },
        },
      },
    },
    fill: {
      colors: ["#B772FF"],
    },
    stroke: {
      lineCap: "round",
      width: 16,
    },
    labels: ["Progress"],
  };

  const series = [safeNumber(percentage)];

  return (
    <div className="chart-container position-relative">
      <Chart options={options} series={series} type="radialBar" height={280} />
      <div className="d-flex flex-column custom-chart-label position-absolute align-items-center start-50 translate-middle">
        <img
          className="w-40px h-40px"
          src="https://guardianshot.blr1.digitaloceanspaces.com/expense/avatar/e55ed62e-e51d-4367-83db-bc0a918c81c9.png"
          alt=""
        />
        <span className="mt-1 fs-16 fw-medium">
          {formateAmount({ price: safeSpendAmount })}
        </span>
        <span className="fs-12">
          <span className="">
            {currency}
            {formateAmount({ price: safeMaxAmount })}
          </span>
          <span className="ms-1">{capitalizeFirstLetter(period)}</span>
        </span>
      </div>
      {/* <Chart options={options} series={series} type="radialBar" height={300} /> */}
    </div>
  );
};

export default BudgetChart;

BudgetChart.propTypes = {
  spendAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  currency: PropTypes.string,
  period: PropTypes.string,
};
