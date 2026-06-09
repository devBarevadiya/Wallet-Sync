import ReactApexChart from "react-apexcharts";
import PropTypes from "prop-types";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import { memo, useState } from "react";
import DateFilterModal from "../../../components/admin/modals/DateFilterModal";
import { Link } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import { setChartOrderHide } from "../../../store/dashboard/slice";
import { useDispatch } from "react-redux";
import { formateAmount } from "../../../helpers/commonFunctions";
import { analyticsTypeEnum } from "../../../helpers/enum";

const CashFlow = ({ data, enumTitle = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModal, setIsModal] = useState(false);

  const dispatch = useDispatch();
  const balance = data?.balance || 0;
  const total = data?.income + data?.expense || 0;
  const income = data?.income;
  const incomeInPercent = Math.round(income > 0 ? (income / total) * 100 : 0);
  const expense = data?.expense;
  const expenseInPercent = Math.round(
    expense > 0 ? (expense / total) * 100 : 0
  );
  const priceDifference = income - expense;

  const incomeOptions = {
    series: [incomeInPercent],
    chart: {
      height: 350,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "70%", // This controls the hollow (inner circle) size
        },
        track: {
          background: "#f0f0f0", // Background color of the track
          strokeWidth: "100%", // Increase this to make the bar thicker
        },
        dataLabels: {
          show: false,
          value: {
            fontSize: "24px", // Font size of the value in the center
          },
        },
      },
    },
    fill: {
      colors: ["#57CA60"], // This changes the color of the radial bar to green
    },
    labels: ["Cricket"],
  };

  const expenseOptions = {
    series: [expenseInPercent],
    chart: {
      height: 350,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "70%", // This controls the hollow (inner circle) size
        },
        track: {
          background: "#f0f0f0", // Background color of the track
          strokeWidth: "100%", // Increase this to make the bar thicker
        },
        dataLabels: {
          show: false,
          value: {
            fontSize: "24px", // Font size of the value in the center
          },
        },
      },
    },
    fill: {
      colors: ["#ff0000"], // This changes the color of the radial bar to green
    },
    labels: ["Cricket"],
  };

  return (
    <div className="responsive">
      <div className="d-flex align-items-center justify-content-between border-bottom border-dark-white-color pb-2 pb-sm-3 ">
        <h6 className="p-0 m-0 fs-18">Cash Flow</h6>
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
      <span className="ms- me-4 mt-3 d-block fs-14 text-color-monsoon mb-2">
        Total Balance
        <span
          className={`${
            priceDifference > 0 ? "text-color-light-green" : "text-color-invalid"
          } main-text-color fs-28 d-block fw-semibold text-truncate`}
        >
          {/* {formateAmount({ price: balance })} */}
          {formateAmount({ price: priceDifference })}
        </span>
      </span>
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center cashflow-chart pe-none">
        <div className="variant-green position-relative">
          <ReactApexChart
            options={incomeOptions}
            series={incomeOptions.series}
            type="radialBar"
            height={200}
            width={200}
          />
          <span className="label position-absolute start-50 translate-middle truncate-line-1 d-block text-break fw-medium text-color-green fs-16">
            {incomeInPercent}%
          </span>
          <h6 className="text-center text-color-monsoon fs-14 mb-1">Income</h6>
          <span className="text-center d-block fs-16 fw-medium">
            {formateAmount({ price: income })}
          </span>
        </div>
        <DateFilterModal
          enumValue={analyticsTypeEnum.CASH_FLOW}
          isShow={isModal}
          onHide={() => setIsModal(false)}
        />
        <div className="variant-red position-relative">
          <ReactApexChart
            options={expenseOptions}
            series={expenseOptions.series}
            type="radialBar"
            height={200}
            width={200}
          />
          <span className="label position-absolute truncate-line-1 d-block text-break start-50 translate-middle fw-medium text-color-invalid">
            {expenseInPercent}%
          </span>
          <h6 className="text-center text-color-monsoon fs-14 mb-1">Expense</h6>
          <span className="text-center d-block fs-16 fw-medium">
            {formateAmount({ price: expense })}
          </span>
        </div>
      </div>
    </div>
  );
};

CashFlow.propTypes = {
  data: PropTypes.object,
  enumTitle: PropTypes.string,
};

export default memo(CashFlow);
