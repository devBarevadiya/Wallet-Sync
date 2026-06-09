import { memo, useCallback, useEffect } from "react";
import { Table } from "react-bootstrap";
import { transactionTypeEnum } from "../../../helpers/enum";
import { formateAmount } from "../../../helpers/commonFunctions";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import PaginationDiv from "../../../components/admin/pagination/PaginationDiv";
import { useDispatch } from "react-redux";
import { getPlannedByFiltersThunk } from "../../../store/planned/thunk";
import DynamicLordIcon from "../../../components/DynamicLordIcon";
import RecordsLoader from "../accounts/RecordsLoader";

const PlannedPaymentRecords = ({ data, handleEdit }) => {
  const recordsData = data;
  const { loading, pagination, filterOptions } = useSelector(
    (store) => store.Planned
  );
  const active = pagination?.page || 1;
  const limit = pagination?.limit || 0;
  const totalItems = pagination?.totalItems;
  const totalPages = pagination?.totalPages;
  const dispatch = useDispatch();

  const handleEditData = useCallback(
    (values) => handleEdit(values),
    [handleEdit]
  );

  const getDaysLeft = useCallback((value) => {
    const today = new Date();
    const target = new Date(value);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const difference = target - today;
    return Math.round(difference / (1000 * 60 * 60 * 24));
  }, []);

  const handlePagination = useCallback(
    (page) => {
      dispatch(getPlannedByFiltersThunk({ ...filterOptions, page }));
    },
    [filterOptions]
  );

  // useEffect(() => {
  //   dispatch(getPlannedByFiltersThunk({ ...filterOptions, page: 1 }));
  // }, [dispatch, filterOptions]);

  return (
    <>
      <div className="p-3 rounded-bottom-4 bg-white border common-border-color border-top-0 layout-content-table-with-title-content-height invisible-scrollbar">
        <Table responsive className="pb-0 mb-0 no-border align-middle">
          <tbody>
            {!loading &&
              recordsData?.map((item, index) => {
                const icon =
                  import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                  item?.category?.icon;
                const title = item?.title;
                const categoryTitle = item?.category?.title;
                const type = item?.type;
                const currencySymbol = item?.account?.currency?.symbol;
                const amount = item?.amount;
                const nextPaymentDate = item?.nextPaymentDate;
                const timeDifference = getDaysLeft(nextPaymentDate);

                return (
                  <tr
                    key={index}
                    onClick={() => handleEditData(item)}
                    className="cursor-pointer"
                  >
                    <td
                      className={`py-3 border-0 ${
                        index + 1 == recordsData?.length ? "" : "border-bottom"
                      } border-dark-white-color`}
                    >
                      <div className="d-flex gap-3">
                        <img src={icon} className="w-40px h-40px br-8" alt="" />
                        <span>
                          <h6 className="p-0 m-0 fs-16 text-capitalize max-w-300px text-truncate pe-5">
                            {title}
                          </h6>
                          <span className="fs-13 text-color-light-gray text-capitalize max-w-300px text-truncate d-block mt-1">
                            {categoryTitle}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td
                      className={`py-3 border-0 ${
                        index + 1 == recordsData?.length ? "" : "border-bottom"
                      } border-dark-white-color`}
                    >
                      <div className="d-flex text-end justify-content-end align-items-center gap-2">
                        <span>
                          <span
                            className={`${
                              type == transactionTypeEnum.INCOME
                                ? "text-color-light-green"
                                : type == transactionTypeEnum.EXPENSE
                                ? "text-color-invalid"
                                : ""
                            } fs-16 fw-semibold text-nowrap`}
                          >
                            {type == transactionTypeEnum.INCOME
                              ? amount > 0
                                ? "+ "
                                : ""
                              : type == transactionTypeEnum.EXPENSE
                              ? amount > 0
                                ? "- "
                                : ""
                              : ""}
                            {currencySymbol + formateAmount({ price: amount })}
                          </span>
                          {nextPaymentDate ? (
                            <span className="fs-13 text-color-silver-sand text-capitalize d-block">
                              {` ${
                                timeDifference > 0
                                  ? timeDifference == 1
                                    ? "Tommorow"
                                    : `in ${timeDifference} days`
                                  : timeDifference == 0
                                  ? "Today"
                                  : `${0 - timeDifference} Days overdue`
                              }`}
                            </span>
                          ) : (
                            <span className="fs-13 text-color-gray text-capitalize d-block">
                              Ended
                            </span>
                          )}
                        </span>
                        <i className="ri-arrow-right-s-line fs-28"></i>
                      </div>
                    </td>
                  </tr>
                );
              })}

            {!loading && !data?.length && (
              <tr>
                <td colSpan={2} className="border-0">
                  <DynamicLordIcon
                    coverClass="bg-white"
                    icon="abwrkdvl"
                    subTitle="No record found for the provided filter."
                    title="Oops! Record Not Found!"
                  />
                </td>
              </tr>
            )}

            {loading && <RecordsLoader />}
          </tbody>
        </Table>
        {totalItems > limit && !loading ? (
          <div className={`p-3`}>
            <PaginationDiv
              active={active}
              limit={limit}
              totalItems={totalItems}
              size={totalPages}
              step={1}
              icons={true}
              onClickHandler={(value) => handlePagination(value)}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};

PlannedPaymentRecords.propTypes = {
  data: PropTypes.array,
  handleEdit: PropTypes.func,
};

export default memo(PlannedPaymentRecords);
