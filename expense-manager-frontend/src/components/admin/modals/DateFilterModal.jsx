import { Button, Modal } from "react-bootstrap";
import ModelWrapper from "../../ModelWrapper";
import PropTypes from "prop-types";
import { useState } from "react";
import {
  analyticsTypeEnum,
  filterEndDate,
  filterStartDate,
} from "../../../helpers/enum";
import {
  DateRangePicker,
  createStaticRanges,
  defaultStaticRanges,
} from "react-date-range";
import { endOfYear, startOfYear, subYears } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "../../../helpers/commonFunctions";
import { singleAnalyticsThunk } from "../../../store/actions";
import { useMediaQuery } from "react-responsive";

const DateFilterModal = ({
  isShow,
  onHide,
  title,
  enumValue = analyticsTypeEnum.BALANCE_TREND,
  dispatchFunc,
  fromDate,
  toDate,
}) => {
  const { singleChartLoading } = useSelector((store) => store.Dashboard);
  const dispatch = useDispatch();
  const [state, setState] = useState([
    {
      startDate: fromDate || filterStartDate,
      endDate: toDate || filterEndDate,
      key: "selection",
    },
  ]);

  const xl = useMediaQuery({ query: "(max-width: 1400px)" });
  const sm = useMediaQuery({ query: "(max-width: 621px)" });

  // add custom range to calendar
  const customStaticRanges = createStaticRanges([
    ...defaultStaticRanges,
    {
      label: "This Year",
      range: () => ({
        startDate: startOfYear(new Date()),
        endDate: new Date(),
      }),
    },
    {
      label: "Last Year",
      range: () => ({
        startDate: startOfYear(subYears(new Date(), 1)),
        endDate: endOfYear(subYears(new Date(), 1)),
      }),
    },
    {
      label: "All Dates",
      range: () => ({
        startDate: new Date(2024, 0, 1),
        endDate: new Date(),
      }),
    },
  ]);

  // handle date selection
  const handleDateSelect = async () => {
    if (dispatchFunc) {
      dispatch(
        dispatchFunc({
          fromDate: formatDate(state[0].startDate, "YYYY-MM-DD"),
          toDate: formatDate(state[0].endDate, "YYYY-MM-DD"),
        })
      );
      onHide();
    } else {
      const response = await dispatch(
        singleAnalyticsThunk({
          [enumValue]: {
            include: true,
            parameters: {
              fromDate: formatDate(state[0].startDate, "YYYY-MM-DD"),
              toDate: formatDate(state[0].endDate, "YYYY-MM-DD"),
            },
          },
        })
      );
      if (singleAnalyticsThunk.fulfilled.match(response)) {
        onHide();
      }
    }
  };

  return (
    <ModelWrapper
      show={isShow}
      onHide={() => onHide()}
      title={title || "Filter"}
      className="modal-fit-width date-modal"
    >
      <Modal.Body className="p-0">
        <div className={`${sm ? "responsive-calender" : ""} position-relative`}>
          <DateRangePicker
            onChange={(item) => setState([item.selection])}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={xl ? 1 : 2}
            ranges={state}
            direction="horizontal"
            staticRanges={customStaticRanges}
            rangeColors={["#b772ff"]}
          />
        </div>
        <div className="">
          {/* <Button
            disabled={singleChartLoading}
            className="me-2 mb-2 primary-btn fs-14 py-2 v-fit submit"
            onClick={() =>
              setState([
                {
                  startDate: startOfYear(new Date()),
                  endDate: filterEndDate,
                  key: "selection",
                },
              ])
            }
          >
            All dates
          </Button> */}
          <Button
            disabled={singleChartLoading}
            className="ms-auto d-block me-2 mb-2 primary-btn fs-14 py-2 v-fit submit"
            onClick={handleDateSelect}
          >
            {singleChartLoading ? "Loading..." : "Submit"}
          </Button>
        </div>
      </Modal.Body>
    </ModelWrapper>
  );
};

DateFilterModal.propTypes = {
  isShow: PropTypes.bool,
  onHide: PropTypes.func,
  title: PropTypes.string,
  enumValue: PropTypes.string,
};

export default DateFilterModal;
