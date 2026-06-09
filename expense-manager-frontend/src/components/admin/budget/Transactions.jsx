import { useSelector } from "react-redux";
import {
  formatDate,
  formatTime,
  formateAmount,
} from "../../../helpers/commonFunctions";
import { useDispatch } from "react-redux";
import { budgetTransactionsPaginationThunk } from "../../../store/actions";
import { useParams } from "react-router-dom";
import { Col } from "react-bootstrap";
import { memo, useCallback, useState } from "react";
import ToggleMenu from "../ToggleMenu";
import FilterModal from "../modals/budgetModals/FilterModal";
import TransactionLoading from "./loading/TransactionLoading";

const Transactions = () => {
  const {
    transactionData,
    transactionPagination,
    tPaginationLoading,
    filterData,
    loading,
  } = useSelector((store) => store.Budget);
  const { baseCurrency } = useSelector((store) => store.Auth);
  const [toggle, setToggle] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const currencySymbol = baseCurrency?.symbol;
  const transactions = transactionData?.transactions;
  const totalPages = transactionPagination?.totalPages;
  const page = transactionPagination?.page;
  const maxAmount = transactionData?.maxAmount || 0;
  const remainAmount = transactionData?.remainingAmount || 0;
  const spentAmount = transactionData?.spendAmount || 0;
  const dispatch = useDispatch();
  const { id } = useParams();

  const handlePagination = async () => {
    if (!tPaginationLoading) {
      await dispatch(
        budgetTransactionsPaginationThunk({
          id,
          page: page + 1,
          values: filterData,
        })
      );
    }
  };

  const handleOpen = useCallback(() => {
    setFilterModal(true);
  }, []);

  const handleClose = useCallback(() => {
    setFilterModal(false);
  }, []);

  return (
    <>
      <div className="responsive common-light-primary-shadow  common-border-color overflow-hidden  br-20 budgetCategory border card   bg-white rounded">
        <div className="overflow-scroll-design budget-card-height ">
          <span
            className={`${
              page < totalPages ? "white-overla" : ""
            } position-sticky top-100 w-100`}
          ></span>
          <div className="transaction">
            <div className="card-header position-sticky border-0 top-0 p-20px p-sm-4 pb-sm-0 bg-white z-50">
              <div className="d-flex align-items-center justify-content-between pb-2">
                <h5 className="fs-21 fw-medium">Transactions</h5>
                <ToggleMenu
                  margin={"0"}
                  rootClass={"transaction"}
                  isOpen={toggle}
                  onClick={() => setToggle((pre) => !pre)}
                  onClose={() => setToggle(false)}
                >
                  <p
                    onClick={handleOpen}
                    className="text-color-secondary m-0 fs-14 cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                  >
                    Filter
                  </p>
                </ToggleMenu>
              </div>
              <div className="d-flex align-items-center justify-content-between py-3 border-top border-dark-white-color">
                <Col
                  xs={4}
                  className="text-center border-end border-dark-white-color"
                >
                  <span className="d-block text-color-monsoon">Plan</span>
                  <span className="fw-medium truncate-line-1 text-break text-wrap">
                    {currencySymbol + formateAmount({ price: maxAmount })}
                  </span>
                </Col>
                <Col
                  xs={4}
                  className="text-center border-end border-dark-white-color"
                >
                  <span className="d-block text-color-monsoon">Spent</span>
                  <span className="fw-medium truncate-line-1 text-break text-wrap">
                    {currencySymbol + formateAmount({ price: spentAmount })}
                  </span>
                </Col>
                <Col xs={4} className="text-center">
                  <span className="d-block text-color-monsoon">
                    {remainAmount >= 0 ? "Remain" : "Over spent"}
                  </span>
                  <span className="fw-medium truncate-line-1 text-break text-wrap">
                    {currencySymbol + formateAmount({ price: remainAmount })}
                  </span>
                </Col>
              </div>
            </div>
            {(transactions?.length > 0 || loading || tPaginationLoading) && (
              <ul className="list-group p-20px p-sm-4 pt-0 pb-3 pb-sm-3 list-group-flush d-flex flex-column gap-3">
                {transactions?.length && !loading
                  ? transactions?.map((ele, i) => {
                      const transaction = ele?.transactions;
                      {
                        return transaction?.map((item, index) => {
                          const icon = item?.category?.icon;
                          const amount = item?.amount;
                          const date = item?.date;
                          const categoryTitle = item?.category?.title;
                          const currencySymbol = item?.currency?.symbol;
                          const color = item?.category?.color;

                          return (
                            <li key={index}>
                              <div
                                key={index}
                                className={`${
                                  transactions?.length == i + 1 &&
                                  index + 1 == transaction?.length
                                    ? ""
                                    : "border-bottom border-dark-white-color pb-3"
                                } d-flex align-items-center justify-content-between`}
                              >
                                <div className="d-flex gap-3 align-items-center">
                                  <img
                                    src={
                                      import.meta.env
                                        .VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                                      icon
                                    }
                                    alt=""
                                    className="w-45px h-45px object-fit-cover br-12"
                                    style={{
                                      boxShadow: `0px 4px 10px 0px ${color}4D`,
                                    }}
                                  />
                                  <div>
                                    <h6 className="m-0 p-0 fs-15 truncate-line-1 text-break pe-4 text-capitalize">
                                      {categoryTitle}
                                    </h6>
                                    <span className="fs-12 text-color-monsoon">
                                      {formatDate(date, "DD MMM YYYY")}{" "}
                                      {formatTime(date, "h:mm A")}
                                    </span>
                                  </div>
                                </div>
                                <span className="d-flex flex-column fs-15 fw-medium text-nowrap align-items-end text-color-invalid">
                                  -{" "}
                                  {currencySymbol +
                                    formateAmount({ price: amount })}
                                </span>
                              </div>
                            </li>
                          );
                        });
                      }
                    })
                  : null}
                {(loading || tPaginationLoading) && (
                  <div
                    className={`${
                      tPaginationLoading
                        ? "mt- pt-3 border-dark-white-color border-top"
                        : ""
                    }`}
                  >
                    <TransactionLoading />
                  </div>
                )}
                {totalPages > page ? (
                  <span
                    onClick={handlePagination}
                    className="position-relative z-50 text-color-primary border-top border-dark-white-color pt-3 text-center cursor-pointer d-inline"
                  >
                    {tPaginationLoading ? "Loading..." : "See More"}
                  </span>
                ) : (
                  ""
                )}
              </ul>
            )}
            {!loading && !transactions?.length && (
              <span className="d-block text-center client-section-bg-color mx-4 text-color-gray p-2 br-10 mt-3">
                Oops! No Transactions Yet!
              </span>
            )}
          </div>
        </div>
      </div>

      <FilterModal
        isOpen={filterModal}
        onClose={handleClose}
        open={handleOpen}
      />
    </>
  );
};

export default memo(Transactions);
