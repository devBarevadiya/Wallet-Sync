import { useCallback, useMemo } from "react";
import ModelWrapper from "../../ModelWrapper";
import { Col, Modal, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import BalanceTrend from "../../../pages/admin/dashboard/BalanceTrend";
import ExpenseStructure from "../../../pages/admin/dashboard/ExpenseStructure";
import LastRecords from "../../../pages/admin/dashboard/LastRecords";
import CashFlow from "../../../pages/admin/dashboard/CashFlow";
import TopExpense from "../../../pages/admin/dashboard/TopExpense";
import BalanceByCurrency from "../../../pages/admin/dashboard/BalanceByCurrency";
import Planned from "../../../pages/admin/dashboard/Planned";
import Budget from "../../../pages/admin/dashboard/Budget";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useDispatch } from "react-redux";
import { setChartOrder } from "../../../store/dashboard/slice";
import { subDays } from "date-fns";
import { formatDate } from "../../../helpers/commonFunctions";
import { defaultDashboardData } from "../../../data/admin/dashboard";
import { analyticsTypeEnum } from "../../../helpers/enum";
import { useModalScroll } from "../../../helpers/customHooks";

const AddCardModal = ({ isOpen, onClose }) => {
  const { data: dashboardData, chartOrder } = useSelector(
    (store) => store.Dashboard
  );

  const filterData = chartOrder?.filter((item) => !item?.isShow);
  const dispatch = useDispatch();

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const chartComponents = useMemo(() => {
    return filterData
      ?.map((item, index) => {
        const enumVal = item?.enum;
        switch (enumVal) {
          case analyticsTypeEnum.BALANCE_TREND:
            return {
              enumVal,
              element: (
                <div
                  key={index}
                  className="item bg-white p-4 br-18 border common-border-color common-light-primary-shadow"
                >
                  <BalanceTrend
                    data={
                      dashboardData?.[analyticsTypeEnum.BALANCE_TREND]?.length
                        ? dashboardData?.[analyticsTypeEnum.BALANCE_TREND]
                        : defaultDashboardData?.[
                            analyticsTypeEnum.BALANCE_TREND
                          ]
                    }
                    enumTitle={analyticsTypeEnum.BALANCE_TREND}
                    isShowList={false}
                  />
                </div>
              ),
            };

          case analyticsTypeEnum.SPENDING:
            return {
              enumVal,
              element: (
                <div
                  key={index}
                  className="item bg-white p-4 br-18 border common-border-color common-light-primary-shadow"
                >
                  <ExpenseStructure
                    data={
                      dashboardData?.[analyticsTypeEnum.SPENDING]?.length > 0
                        ? dashboardData?.[analyticsTypeEnum.SPENDING]
                        : defaultDashboardData?.[analyticsTypeEnum.SPENDING]
                    }
                    enumTitle={analyticsTypeEnum.SPENDING}
                    isShowList={false}
                  />
                </div>
              ),
            };

          case analyticsTypeEnum.LAST_RECORD:
            return {
              enumVal,
              element: (
                <div
                  key={index}
                  className="item bg-white p-4 br-18 border common-border-color common-light-primary-shadow"
                >
                  <LastRecords
                    data={
                      dashboardData?.[analyticsTypeEnum.LAST_RECORD]?.length > 0
                        ? dashboardData?.[analyticsTypeEnum.LAST_RECORD]
                        : defaultDashboardData?.[analyticsTypeEnum.LAST_RECORD]
                    }
                    enumTitle={analyticsTypeEnum.LAST_RECORD}
                  />
                </div>
              ),
            };

          case analyticsTypeEnum.CASH_FLOW:
            return {
              enumVal,
              element: (
                <div
                  key={index}
                  className="item bg-white p-4 br-18 border common-border-color cash-flow-chart common-light-primary-shadow"
                >
                  <CashFlow
                    data={
                      Object?.entries(
                        dashboardData?.[analyticsTypeEnum.CASH_FLOW] || {}
                      )?.filter(([, item]) => item > 0)?.length > 0
                        ? dashboardData?.[analyticsTypeEnum.CASH_FLOW]
                        : defaultDashboardData?.[analyticsTypeEnum.CASH_FLOW]
                    }
                    enumTitle={analyticsTypeEnum.CASH_FLOW}
                  />
                </div>
              ),
            };

          case analyticsTypeEnum.COSTLY_EXPENSES:
            return {
              enumVal,
              element: (
                <div
                  key={index}
                  className="item bg-white p-4 br-18 border common-border-color cash-flow-chart common-light-primary-shadow"
                >
                  <TopExpense
                    data={
                      dashboardData?.[analyticsTypeEnum.COSTLY_EXPENSES]
                        ?.length > 0
                        ? dashboardData?.[analyticsTypeEnum.COSTLY_EXPENSES]
                        : defaultDashboardData?.[
                            analyticsTypeEnum?.COSTLY_EXPENSES
                          ]
                    }
                    enumTitle={analyticsTypeEnum.COSTLY_EXPENSES}
                  />
                </div>
              ),
            };

          case analyticsTypeEnum.CURRENCY:
            return {
              enumVal,
              element: (
                <div
                  key={index}
                  className="item bg-white p-4 br-18 border common-border-color cash-flow-chart common-light-primary-shadow"
                >
                  <BalanceByCurrency
                    data={
                      dashboardData?.[analyticsTypeEnum.CURRENCY]?.length > 0
                        ? dashboardData?.[analyticsTypeEnum.CURRENCY]
                        : defaultDashboardData?.[analyticsTypeEnum.CURRENCY]
                    }
                    enumTitle={analyticsTypeEnum.CURRENCY}
                  />
                </div>
              ),
            };

          case analyticsTypeEnum.PLANNED:
            // if (dashboardData?.PLANNED?.length > 0) {
            return {
              enumVal,
              element: (
                <div
                  key={index}
                  className="item bg-white p-4 br-18 border common-border-color common-light-primary-shadow"
                >
                  <Planned
                    data={
                      dashboardData?.[analyticsTypeEnum.PLANNED]?.length > 0
                        ? dashboardData?.[analyticsTypeEnum.PLANNED]
                        : defaultDashboardData?.[analyticsTypeEnum.PLANNED]
                    }
                    enumTitle={analyticsTypeEnum.PLANNED}
                  />
                </div>
              ),
            };
          // }
          case analyticsTypeEnum.BUDGET:
            return {
              enumVal,
              element: (
                <div
                  key={index}
                  className="item bg-white p-4 br-18 border common-border-color common-light-primary-shadow"
                >
                  <Budget
                    data={
                      dashboardData?.[analyticsTypeEnum.BUDGET]?.length > 0
                        ? dashboardData?.[analyticsTypeEnum.BUDGET]
                        : defaultDashboardData?.[analyticsTypeEnum.BUDGET]
                    }
                    enumTitle={analyticsTypeEnum.BUDGET}
                  />
                </div>
              ),
            };
          // break;
          default:
            return null;
        }
      })
      .filter(Boolean); // Filter out any null values
  }, [dashboardData, filterData]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const toggleIsShow = (value) => {
    const updatedItems = chartOrder?.map((item) => {
      if (item?.enum == value) {
        return { ...item, isShow: true };
      }
      return item;
    });
    dispatch(setChartOrder(updatedItems));
    filterData?.length <= 1 && handleClose();
    // handleClose();
    // setItems(updatedItems);
  };

  return (
    <ModelWrapper
      show={isOpen}
      onHide={handleClose}
      className="modal-850px responsive"
      title="Add Card"
    >
      <Modal.Body ref={modalBodyRef} className="pt-0">
        <ResponsiveMasonry
          // columnsCountBreakPoints={{ 350: 1, 750: 2, 1200: 3 }}
          columnsCountBreakPoints={{ 350: 1, 800: 2, 991: 2, 1080: 2 }}
          className="mt-4"
        >
          <Masonry gutter="1.2rem" className="responsive">
            {chartComponents?.map((item, index) => (
              <div
                key={index}
                className="add-dashboard-card-item position-relative cursor-pointer"
                onClick={() => toggleIsShow(item?.enumVal)}
              >
                {item?.element}
                <i className="ri-add-large-line add-btn transition opacity-0 display-5 text-white position-absolute z-2 top-50 start-50 translate-middle"></i>
              </div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </Modal.Body>
    </ModelWrapper>
  );
};

export default AddCardModal;
