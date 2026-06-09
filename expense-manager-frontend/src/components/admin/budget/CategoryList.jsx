import { useCallback, useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "remixicon/fonts/remixicon.css";
import { capitalizeFirstLetter } from "../../../helpers/commonFunctions";
import BudgetLimitType from "../modals/budgetModals/BudgetLimitType";
import { budgetLimitTypeEnum } from "../../../helpers/enum";
import { toastError } from "../../../config/toastConfig";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { budgetDetailsThunk, updateBudgetThunk } from "../../../store/actions";
import CategoryBudgetLimitTypeModal from "../modals/budgetModals/CategoryBudgetLimitTypeModal";
import HeadCategoryModal from "../modals/budgetModals/HeadCategoryModal";
import ListLoading from "./loading/ListLoading";
import { ButtonToolbar, OverlayTrigger, Tooltip } from "react-bootstrap";

const CategoryList = ({ data = [], loading }) => {
  const headData = useMemo(() => data?.headCategories, [data?.headCategories]);
  const [expanded, setExpanded] = useState(null);
  const [isTypeModal, setIsTypeModal] = useState(false);
  const [isSubTypeModal, setIsSubTypeModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [subEditData, setSubEditData] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [subInputValues, setSubInputValues] = useState({});
  const { detailsData } = useSelector((state) => state.Budget);
  const [isHeadModal, setIsHeadModal] = useState(false);
  const dispatch = useDispatch();

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };
  const period = data?.period || "";

  const handleOpenTypeModal = useCallback((editValue) => {
    setEditData(editValue);
    setIsTypeModal(true);
  }, []);

  const handleCloseTypeModal = useCallback(() => {
    setEditData({});
    setIsTypeModal(false);
  }, []);

  const handleSetInputValue = useCallback(
    (id, value) => {
      setInputValues((pre) => ({ ...pre, [id]: value }));
    },
    [inputValues]
  );

  const handleHeadModal = useCallback((value) => {
    setIsHeadModal(value);
  }, []);

  const handleOpenSubuTypeModal = useCallback((editValue) => {
    setSubEditData(editValue);
    setIsSubTypeModal(true);
  }, []);

  const handleCloseSubTypeModal = useCallback(() => {
    setSubEditData({});
    setIsSubTypeModal(false);
  }, []);

  const handleHeadBlur = useCallback((id, value = 0, preValue = 0) => {
    if (preValue == value) {
      setInputValues((pre) => ({ ...pre, [id]: value }));
    } else {
      setInputValues((pre) => ({ ...pre, [id]: preValue }));
    }
  }, []);

  const handleSubBlur = useCallback((id, value = 0, preValue = 0) => {
    if (preValue == value) {
      setSubInputValues((pre) => ({ ...pre, [id]: value }));
    } else {
      setSubInputValues((pre) => ({ ...pre, [id]: preValue }));
    }
  }, []);

  const handleSetSubInputValue = useCallback(
    ({ headCategory, value, subCategory }) => {
      setSubInputValues((pre) => ({ ...pre, [subCategory?._id]: value }));
    },
    [subInputValues]
  );

  const allSubTotal = useMemo(() => {
    const amount = Object?.values(subInputValues || {});
    return amount?.reduce((acc, curr) => acc + Number(curr), 0);
  }, [subInputValues]);

  const headTotal = useMemo(() => {
    const amount = Object?.values(inputValues || {});
    return amount?.reduce((acc, curr) => acc + Number(curr), 0);
  }, [inputValues]);

  const noLimitTotalHead = useMemo(
    () =>
      detailsData?.headCategories?.reduce((acc, curr) => {
        if (
          curr?.maxAmount == 0 ||
          curr?.spendLimitType !== budgetLimitTypeEnum.LIMIT
        ) {
          const amount = curr?.categories?.reduce(
            (subAcc, subCurr) => subAcc + Number(subCurr?.maxAmount),
            0
          );
          return acc + amount;
        }
        return acc;
      }, 0),
    [detailsData]
  );

  const handleSubmit = useCallback(
    async ({ id, headId, subCategory = {}, spendLimitType }) => {
      const value = inputValues?.[id];
      const subTotal = subCategory?.reduce(
        (acc, curr) => Number(curr?.maxAmount) + acc,
        0
      );
      if (
        detailsData?.maxAmount < headTotal ||
        detailsData?.maxAmount < headTotal + noLimitTotalHead
      ) {
        toastError(
          `You can only update the value within the remaining budget limit.`
        );
        return;
      }

      if (detailsData?.maxAmount < value) {
        toastError(
          "You can only update the value within the remaining budget limit."
        );
        return;
      }

      if (value < subTotal) {
        toastError("Set a value that is at least the subcategories' total.");
        return;
      }

      const response = await dispatch(
        updateBudgetThunk({
          id: detailsData?._id,
          values: {
            headCategories: [
              {
                headCategory: headId,
                maxAmount: Number(inputValues?.[id]),
                spendLimitType: spendLimitType,
              },
            ],
          },
        })
      );
      if (updateBudgetThunk?.fulfilled.match(response)) {
        await dispatch(budgetDetailsThunk(detailsData?._id));
      }
    },
    [inputValues, detailsData, dispatch, headTotal]
  );

  const handleSubSubmit = useCallback(
    async ({ id, subCategory, spendLimitType, headData }) => {
      const subTotal = headData?.categories?.reduce(
        (acc, curr) => acc + Number(subInputValues?.[curr?._id]),
        0
      );

      if (allSubTotal > detailsData?.maxAmount) {
        toastError(`You can edit the value within ${detailsData?.maxAmount}.`);
        return;
      }

      if (
        headData?.spendLimitType !== budgetLimitTypeEnum.LIMIT &&
        detailsData?.maxAmount - headTotal < subTotal
      ) {
        if (detailsData?.maxAmount - headTotal <= 0) {
          toastError("Budget limit exceeded");
        } else {
          toastError(
            `You can edit the value within ${
              detailsData?.maxAmount - headTotal
            }.`
          );
        }
        return;
      }

      if (
        headData?.spendLimitType == budgetLimitTypeEnum.LIMIT &&
        headData?.maxAmount < subTotal
      ) {
        toastError("You can edit the value within the head category.");
        return;
      }

      const response = await dispatch(
        updateBudgetThunk({
          id: detailsData?._id,
          values: {
            headCategories: [
              {
                headCategory: headData?.headCategory?._id,
                // maxAmount: Number(subInputValues?.[id]),
                maxAmount: headData?.maxAmount,
                spendLimitType: headData?.spendLimitType,
                categories: [
                  {
                    category: subCategory?.category?._id,
                    maxAmount: Number(subInputValues?.[id]),
                    spendLimitType: spendLimitType,
                  },
                ],
              },
            ],
          },
        })
      );
      if (updateBudgetThunk?.fulfilled.match(response)) {
        await dispatch(budgetDetailsThunk(detailsData?._id));
      }
    },
    [detailsData, subInputValues]
  );

  const handleResetExpanded = useCallback(() => {
    setExpanded(null);
  }, []);

  useEffect(() => {
    const initialValues = headData?.reduce((acc, curr) => {
      acc[curr?._id] = curr?.maxAmount || 0;
      return acc;
    }, {});

    const subInititalValues = headData?.reduce((acc, head) => {
      head?.categories?.forEach((sub) => {
        acc[sub?._id] = sub?.maxAmount;
      });
      return acc;
    }, {});
    setSubInputValues(subInititalValues);
    setInputValues(initialValues);
  }, [headData]);

  return (
    <>
      <div className="responsive common-light-primary-shadow border overflow-hidden common-border-color br-20 budgetCategory card pt-0 mb-3 bg-white rounded">
        <div className="overflow-scroll-design budget-card-height p-20px p-sm-4 pt-0 pt-sm-0">
          <div className="card-header position-sticky  top-0 z-3 p-0 pb-2 pb-sm-2 bg-white pt-4 border-bottom border-dark-white-color">
            <h5 className="fs-21 fw-medium">Category List</h5>
          </div>
          <ul className="list-group border-0 mb-2 pt-sm-1 list-group-flush d-flex gap-1">
            {headData?.length
              ? headData?.map((headCategory, index) => {
                  const subCategory = headCategory?.categories;
                  const spendLimitType = headCategory?.spendLimitType;
                  const headId = headCategory?._id;
                  const headCategoryId = headCategory?.headCategory?._id;

                  return (
                    <li
                      key={headCategory?.headCategory?._id}
                      className={`list-group-item px-0 border-0 user-select-none`}
                    >
                      <div
                        className={`${
                          index + 1 == headData?.length
                            ? ""
                            : "border-bottom border-dark-white-color pb-3"
                        }  d-flex justify-content-between align-items-center`}
                      >
                        <div className="cursor-pointer d-flex align-items-center">
                          <div>
                            <div
                              className="d-flex align-items-center me-3"
                              onClick={() =>
                                subCategory?.length > 0 &&
                                spendLimitType !== budgetLimitTypeEnum.NONE &&
                                toggleExpand(index)
                              }
                            >
                              <span className="fs-18 fw-medium  text-capitalize text-break max-w-300px truncate-line-1">
                                {" "}
                                {headCategory?.headCategory?.title}
                              </span>
                              {subCategory?.length > 0 &&
                              spendLimitType !== budgetLimitTypeEnum.NONE ? (
                                expanded === index ? (
                                  <i className="ri-arrow-up-s-line ml-2 text-color-monsoon fs-28"></i>
                                ) : (
                                  <i className="ri-arrow-down-s-line text-color-monsoon ml-2 fs-28 "></i>
                                )
                              ) : (
                                ""
                              )}
                            </div>
                            {spendLimitType == budgetLimitTypeEnum.LIMIT && (
                              <span
                                className="d-block text-color-primary"
                                onClick={() =>
                                  handleOpenTypeModal(headCategory)
                                }
                              >
                                <i className="ri-pencil-line me-1 fs-14"></i>
                                <span className="fs-14">Edit</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="mr-2 text-color-monsoon fs-16 fw-medium text-nowrap">
                            {capitalizeFirstLetter(period)}{" "}
                          </span>
                          <span
                            onClick={() =>
                              spendLimitType !== budgetLimitTypeEnum.LIMIT &&
                              handleOpenTypeModal(headCategory)
                            }
                          >
                            {headCategory.spendLimitType !==
                            budgetLimitTypeEnum.LIMIT ? (
                              <span className="bg-dark-white-color br-5 fs-14 fw-medium px-2 py-2 cursor-pointer text-nowrap">
                                {capitalizeFirstLetter(spendLimitType)}
                              </span>
                            ) : (
                              <ButtonToolbar>
                                <OverlayTrigger
                                  placement="top"
                                  trigger="focus"
                                  overlay={
                                    <Tooltip id="tooltip">
                                      Press Enter to Save changes
                                    </Tooltip>
                                  }
                                >
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    onBlur={(e) =>
                                      handleHeadBlur(
                                        headId,
                                        Number(e.target.value),
                                        Number(headCategory?.maxAmount)
                                      )
                                    }
                                    placeholder="0"
                                    value={inputValues?.[headId] || ""}
                                    className="max-w-80px border-0 bg-transparent focus-visible-color-gray bg-dark-white-color br-5 fs-14 fw-medium px-2 py-1"
                                    onChange={(e) =>
                                      handleSetInputValue(
                                        headId,
                                        e.target.value
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key == "Enter") {
                                        handleSubmit({
                                          id: headId,
                                          subCategory,
                                          spendLimitType,
                                          headId: headCategoryId,
                                        });
                                      }
                                    }}
                                  />
                                </OverlayTrigger>
                              </ButtonToolbar>
                            )}
                          </span>
                        </div>
                      </div>
                      {expanded === index && (
                        <ul className="list-group border-bottom border-dark-white-color rounded-0">
                          {subCategory?.map((subCategory) => {
                            const icon = subCategory?.category?.icon;
                            const spendLimitType = subCategory?.spendLimitType;

                            return (
                              <li
                                key={subCategory?.category?._id}
                                className="border-0 py-12px list-group-item border-bottom border-dark-white-color"
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center gap-2">
                                    <img
                                      src={
                                        import.meta.env
                                          .VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                                        icon
                                      }
                                      alt={subCategory?.category?.title}
                                      // className="category-icon"
                                      className="w-38px h-38px object-fit-cover br-10"
                                    />
                                    <span className="fs-16 fw-medium">
                                      <span className="max-w-300px text-break truncate-line-1 me-4">
                                        {subCategory?.category?.title}
                                      </span>
                                      {spendLimitType ==
                                        budgetLimitTypeEnum.LIMIT && (
                                        <span
                                          className="d-block text-color-primary fs-14 cursor-pointer fw-normal"
                                          onClick={() =>
                                            handleOpenSubuTypeModal({
                                              headCategory,
                                              category: subCategory,
                                            })
                                          }
                                        >
                                          <i className="ri-pencil-line me-1"></i>
                                          <span className="">Edit</span>
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center gap-2">
                                    {/* Use the dynamic period here for subcategories as well */}
                                    {/* <span className="mr-2 text-color-monsoon fs-16 fw-medium">
                                  {capitalizeFirstLetter(period)}
                                </span> */}
                                    <span
                                      onClick={() =>
                                        spendLimitType !==
                                          budgetLimitTypeEnum.LIMIT &&
                                        handleOpenSubuTypeModal({
                                          headCategory,
                                          category: subCategory,
                                        })
                                      }
                                      // className="cursor-pointer text-nowrap bg-dark-white-color br-5 fs-14 fw-medium px-2 py-1"
                                    >
                                      {subCategory.spendLimitType !==
                                      budgetLimitTypeEnum.LIMIT ? (
                                        <span className="cursor-pointer text-nowrap bg-dark-white-color br-5 fs-14 fw-medium px-2 py-2">
                                          {capitalizeFirstLetter(
                                            subCategory?.spendLimitType
                                          )}
                                        </span>
                                      ) : (
                                        <span>
                                          <ButtonToolbar>
                                            <OverlayTrigger
                                              placement="top"
                                              trigger="focus"
                                              overlay={
                                                <Tooltip id="tooltip">
                                                  Press Enter to Save changes
                                                </Tooltip>
                                              }
                                            >
                                              <input
                                                inputMode="numeric"
                                                type="number"
                                                // onFocus={(e) =>
                                                //   handleFocus(
                                                //     subCategory?._id,
                                                //     Number(e.target.value)
                                                //   )
                                                // }
                                                onBlur={(e) =>
                                                  handleSubBlur(
                                                    subCategory?._id,
                                                    Number(e.target.value),
                                                    Number(
                                                      subCategory?.maxAmount
                                                    )
                                                  )
                                                }
                                                value={
                                                  subInputValues?.[
                                                    subCategory?._id
                                                  ] || ""
                                                }
                                                placeholder="0"
                                                className="max-w-80px border-0 bg-transparent bg-dark-white-color br-5 fs-14 fw-medium px-2 py-1 focus-visible-color-gray"
                                                onChange={(e) =>
                                                  handleSetSubInputValue({
                                                    headCategory,
                                                    subCategory,
                                                    value: e.target.value,
                                                  })
                                                }
                                                onKeyDown={(e) => {
                                                  if (e.key == "Enter") {
                                                    handleSubSubmit({
                                                      id: subCategory?._id,
                                                      subCategory,
                                                      spendLimitType,
                                                      headData: headCategory,
                                                    });
                                                  }
                                                }}
                                              />
                                            </OverlayTrigger>
                                          </ButtonToolbar>
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })
              : null}
            {loading ? (
              <ListLoading />
            ) : (
              !loading &&
              !headData?.length && (
                <span className="d-block text-center client-section-bg-color text-color-gray p-2 br-10">
                  Oops! No Category Yet!
                </span>
              )
            )}
          </ul>
          <span
            onClick={() => handleHeadModal(true)}
            className="border-0 fs-16 d-block text-color-monsoon text-center border-top border-dark-white-color pt-3 cursor-pointer"
          >
            Add Head Category
          </span>
        </div>
      </div>
      {isTypeModal && (
        <BudgetLimitType
          isOpen={isTypeModal}
          onClose={handleCloseTypeModal}
          editData={editData}
          onSuccess={handleResetExpanded}
          key={"1"}
        />
      )}
      {isSubTypeModal && (
        <CategoryBudgetLimitTypeModal
          isOpen={isSubTypeModal}
          onClose={handleCloseSubTypeModal}
          editData={subEditData}
        />
      )}
      {/* {isHeadModal && ( */}
      <HeadCategoryModal
        isOpen={isHeadModal}
        onClose={() => handleHeadModal(false)}
        close={() => handleHeadModal(false)}
        open={() => handleHeadModal(true)}
        method="addExtra"
      />
      {/* // )} */}
    </>
  );
};

export default CategoryList;
