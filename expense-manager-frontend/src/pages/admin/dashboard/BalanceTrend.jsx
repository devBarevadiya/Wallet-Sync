import ReactApexChart from "react-apexcharts";
import PropTypes from "prop-types";
import {
  aggregateDates,
  formatDate,
  formateAmount,
} from "../../../helpers/commonFunctions";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import { memo, useMemo, useState } from "react";
import DateFilterModal from "../../../components/admin/modals/DateFilterModal";
import { Image } from "../../../data/images";
import { useDispatch } from "react-redux";
import { setChartOrderHide } from "../../../store/dashboard/slice";
import { Link } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";

const BalanceTrend = ({ data = [], enumTitle = "", isShowList = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const dispatch = useDispatch();

  const { seriesDate, dateData } = aggregateDates(data)?.reduce(
    (acc, value) => {
      acc.seriesDate.push(value?.balance);
      acc.dateData.push(formatDate(value?.date, "D MMM"));
      return acc;
    },
    { seriesDate: [], dateData: [] }
  ) || { seriesDate: [], dateData: [] };

  const lastData = useMemo(() => data?.[data?.length - 1], [data]);
  const lastRecords = useMemo(
    () => data?.slice()?.reverse()?.slice(0, 3),
    [data]
  );

  const series = [
    {
      name: "Balance",
      data: seriesDate,
    },
  ];

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    colors: ["#B772FF"],
    xaxis: {
      categories: dateData,
    },
    stroke: {
      curve: "smooth",
      width: 2,
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
  return (
    <div className="h-100">
      {/* <Chart options={options} series={series} type="line" height={350} /> */}
      <div className="d-flex align-items-center justify-content-between me- border-bottom border-dark-white-color pb-2 pb-sm-3">
        <span>
          <h6 className="p-0 m-0 fs-18">Balance Trend</h6>
        </span>
        <span className="">
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
              to={ADMIN.ACCOUNTS.PATH}
              className="main-text-color fw-normal m-0 fs-14 cursor-pointer px-3 py-1 w-100 d-block hover-primary-bg transition-bg"
            >
              More
            </Link>
          </ToggleMenu>
        </span>
      </div>
      <DateFilterModal isShow={isModal} onHide={() => setIsModal(false)} />

      {data?.length > 0 ? (
        <div>
          <span className="text-color-monsoon fs-14 pt-20px d-block">
            Today
          </span>
          <h6 className={`mt-1 fs-28 fw-bold`}>
            {formateAmount({ price: lastData?.balance })}
          </h6>
          <div className="mx--24px">
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={235}
            />
          </div>
          {isShowList && <ul className="m-0 p-0 d-flex flex-column gap-2">
            {lastRecords?.map((item, index) => {
              return (
                <li
                  key={index}
                  className={`d-flex align-items-center justify-content-between border-dark-white-color ${
                    index + 1 == lastRecords?.length ? "" : "border-bottom pb-2"
                  }`}
                >
                  <span className="fs-16">
                    {formatDate(item.date, "DD MMM")}
                  </span>
                  <span className="d-flex flex-column align-items-end">
                    <span className="m-0 p-0 fs-16 fw-medium truncate-line-1 text-break text-capitalize">
                      {formateAmount({ price: item.balance })}
                    </span>
                    <span className="text-color-monsoon fs-12">
                      Account Balance
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>}
        </div>
      ) : (
        <div className="h-100 d-flex flex-column align-items-center justify-content-center">
          <img
            src={Image.noBalanceTrendImg}
            className="mx-auto d-block w-150px"
            alt=""
            style={{ display: "inline-block" }}
          />
          <p className="text-color-light-gray mt-2 fs-14 mb-4">
            There are no data in the selected time interval.
          </p>
        </div>
      )}
    </div>
  );
};

BalanceTrend.propTypes = {
  data: PropTypes.array,
  enumTitle: PropTypes.string,
  isShowList: PropTypes.bool,
};

export default memo(BalanceTrend);
