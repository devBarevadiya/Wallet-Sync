import { memo, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import PropTypes from "prop-types";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import DateFilterModal from "../../../components/admin/modals/DateFilterModal";
import { Image } from "../../../data/images";
import { Link } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import { setChartOrderHide } from "../../../store/dashboard/slice";
import { useDispatch } from "react-redux";
import { formateAmount } from "../../../helpers/commonFunctions";
import { analyticsTypeEnum } from "../../../helpers/enum";

const ExpenseStructure = ({ data = [], enumTitle = "", isShowList = true }) => {
  const chartRef = useRef(null);
  let dataSorting =
    [...data].sort((a, b) => b.amount - a.amount)?.slice(0, 3) || [];
  const restData = [...data]?.slice(3);
  const totalRestAmount = restData?.reduce(
    (acc, curr) => acc + curr?.amount,
    0
  );

  dataSorting = [
    ...dataSorting,
    ...(totalRestAmount > 0
      ? [
          {
            amount: totalRestAmount,
            title: "Other",
            color: "#4682B4",
          },
        ]
      : []),
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [isModal, setIsModal] = useState(false);

  const dispatch = useDispatch();

  const {
    amountData = [],
    titleData = [],
    colorData = [],
  } = dataSorting.reduce(
    (acc, value) => {
      if (value?.amount !== undefined) acc?.amountData.push(value?.amount);
      if (value?.title !== undefined) acc?.titleData.push(value?.title);
      if (value?.color !== undefined) acc?.colorData.push(value?.color);
      return acc;
    },
    { amountData: [], titleData: [], colorData: [] }
  );

  const series = [...amountData];

  const options = {
    chart: {
      type: "donut",
      height: 250,
      toolbar: {
        show: false,
      },
    },
    events: {
      dataPointMouseEnter: function (event, chartContext, config) {
        // console.log("Hovered over:", config.seriesIndex); // Log series index when hovered
      },
      dataPointMouseLeave: function (event, chartContext, config) {
        // console.log("Mouse left:", config.seriesIndex); // Log when mouse leaves
      },
    },
    labels: titleData.length > 0 ? titleData : [],
    legend: {
      show: false,
      position: "bottom",
      horizontalAlign: "center",
      formatter: function (seriesName) {
        return `<div class="text-color-secondary fs-14 fw-medium ms-1">${seriesName}</div>`;
      },
      markers: {
        fillColors: colorData.length > 0 ? colorData : [],
      },
    },
    fill: {
      colors: colorData.length > 0 ? colorData : [],
    },
    tooltip: {
      enabled: true,
      x: {
        format: "dd MMM",
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
    },
  };

  const [hoveredLegend, setHoveredLegend] = useState(null);

  const handleLegendHover = (index) => {
    setHoveredLegend(index);

    if (chartRef.current && chartRef.current.chart) {
      const chart = chartRef.current.chart;

      // Use toggleDataPointSelection instead of toggleSeries
      chart.toggleDataPointSelection(index);
    }
  };

  const handleLegendLeave = () => {
    setHoveredLegend(null); // Reset hovered legend state

    if (chartRef.current && chartRef.current.chart) {
      const chart = chartRef.current.chart;

      // Deselect the currently hovered data point
      if (hoveredLegend !== null) {
        chart.toggleDataPointSelection(hoveredLegend);
      }
    }
  };

  const handleLegendClick = (index) => {
    setHoveredLegend(index);
  };

  return (
    <div className="h-100">
      <div className="d-flex align-items-center justify-content-between border-bottom border-dark-white-color pb-2 pb-sm-3">
        <h6 className="p-0 m-0 fs-18">Expense Structure</h6>
        <span>
          <ToggleMenu
            onClose={() => setIsOpen(false)}
            onClick={() => setIsOpen((pre) => !pre)}
            isOpen={isOpen}
          >
            <p
              className="text-color-secondary m-0 fs-14 cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
              onClick={() => setIsModal(true)}
            >
              Filter
            </p>
            <p
              className="text-color-secondary m-0 fs-14 cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
              onClick={() => dispatch(setChartOrderHide(enumTitle))}
            >
              Hide
            </p>
            <Link
              to={ADMIN.RECORDS.PATH}
              className="main-text-color fw-normal m-0 fs-14 cursor-pointer px-3 py-1 w-100 d-block hover-primary-bg transition-bg"
            >
              More
            </Link>
          </ToggleMenu>
        </span>
      </div>
      <div className="h-100 position-relative responsive">
        {data?.length ? (
          <div className="mt-3">
            <ReactApexChart
              ref={chartRef}
              options={options}
              series={series}
              type="donut"
              height="220px"
            />
            <ul className="custom-legend m-0 p-0 d-flex mt-3 justify-content-center flex-wrap gap-3">
              {titleData?.map((label, index) => (
                <li
                  key={label}
                  className={`legend-item d-flex cursor-pointer align-items-center gap-1 ${
                    hoveredLegend === index ? "active" : ""
                  }`}
                  onClick={() => handleLegendClick(index)}
                  onMouseEnter={() => handleLegendHover(index)}
                  onMouseLeave={handleLegendLeave}
                >
                  <span
                    style={{ backgroundColor: colorData[index] }}
                    className="h-15px w-15px d-block rounded-circle"
                  ></span>
                  <div
                    className="legend-color"
                    style={{
                      backgroundColor: colorData[index] || "#007bff",
                    }}
                  ></div>
                  <span className="fs-14 fw-medium max-w-150px text-truncate d-block">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
            {isShowList && (
              <ul className="p-0 m-0 d-flex flex-column gap-3 mt-4">
                {dataSorting?.map((item, index) => {
                  const icon = item?.icon;
                  const amount = item?.amount;
                  const title = item?.title;
                  const color = item?.color || "";
                  return (
                    <li
                      key={index}
                      className={`d-flex align-items-center justify-content-between ${
                        index + 1 == dataSorting?.length
                          ? ""
                          : "border-bottom pb-3"
                      } border-dark-white-color`}
                    >
                      <span className="d-flex align-items-center gap-3">
                        {icon ? (
                          <img
                            src={
                              import.meta.env
                                .VITE_DIGITAL_OCEAN_SPACES_BASE_URL + icon
                            }
                            alt=""
                            className="category-icon object-fit-cover"
                            style={{ boxShadow: `0px 4px 10px 0px ${color}4D` }}
                          />
                        ) : (
                          <span
                            className="w-45px h-45px object-fit-cover br-10"
                            style={{
                              backgroundColor: "#4682B4",
                              boxShadow: `0px 4px 10px 0px #4682B44D`,
                            }}
                          ></span>
                        )}
                        <h6 className="m-0 p-0 fs-16 truncate-line-1 text-break pe-4 text-capitalize">
                          {title}
                        </h6>
                      </span>
                      <span
                        className={`text-color-invalid fs-15 fw-medium text-nowrap`}
                      >
                        -{formateAmount({ price: amount })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center">
            <img
              src={Image.noExpenseImg}
              className="mx-auto d-bloc w-150px"
              alt=""
              style={{ display: "inline-block" }}
            />
            <p className="text-color-light-gray mt-2 fs-14 mb-4">
              There are no data in the selected time interval.
            </p>
          </div>
        )}
      </div>
      <DateFilterModal
        enumValue={analyticsTypeEnum.SPENDING}
        isShow={isModal}
        onHide={() => setIsModal(false)}
      />
    </div>
  );
};

ExpenseStructure.propTypes = {
  data: PropTypes.array,
  functionHandler: PropTypes.func,
  enumTitle: PropTypes.string,
  isShowList: PropTypes.bool,
};

export default memo(ExpenseStructure);
