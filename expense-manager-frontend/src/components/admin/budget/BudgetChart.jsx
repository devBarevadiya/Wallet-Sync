import React from "react";
import Chart from "react-apexcharts";
import {
  capitalizeFirstLetter,
  formateAmount,
} from "../../../helpers/commonFunctions";

const BudgetChart = ({ spendAmount, maxAmount, currency, period }) => {
  const percentage = ((spendAmount / maxAmount) * 100).toFixed(2);

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
            formatter: (val) => spendAmount,
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
            label: `-${(maxAmount / 30).toFixed(2)} per day`,
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

  const series = [parseFloat(percentage)];

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
          {formateAmount({ price: spendAmount })}
        </span>
        <span className="fs-12">
          <span className="">
            {currency}
            {formateAmount({ price: maxAmount })}
          </span>
          <span className="ms-1">{capitalizeFirstLetter(period)}</span>
        </span>
      </div>
      {/* <Chart options={options} series={series} type="radialBar" height={300} /> */}
    </div>
  );
};

export default BudgetChart;
