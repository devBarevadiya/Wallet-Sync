import { memo, useCallback, useEffect, useMemo, useState } from "react";
import ModelWrapper from "../../../ModelWrapper";
import PropTypes from "prop-types";
import { Button, Form, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  addUpdateHeadCategory,
  setHeadCategoryAmounts,
  setSubCategoryAmounts,
} from "../../../../store/budget/slice";
import { budgetLimitTypeEnum } from "../../../../helpers/enum";
import {
  budgetDetailsThunk,
  updateBudgetThunk,
} from "../../../../store/actions";
import { useModalScroll } from "../../../../helpers/customHooks";

const BudgetLimitType = ({ isOpen, onClose, editData = {}, onSuccess }) => {
  const {
    selectedHeadCategory,
    detailsData,
    actionLoading,
    loading,
    subCategoryAmounts,
    headCategoryAmounts,
  } = useSelector((store) => store.Budget);
  const [selectedType, setSelectedType] = useState("");
  const [selecteddata, setSelectedData] = useState({});
  const isEdit = useMemo(() => Object?.keys(editData)?.length > 0, [editData]);

  const dispatch = useDispatch();
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const closeModal = useCallback(() => {
    setSelectedType("");
    onClose();
  }, [onClose]);

  const typeData = [
    {
      title: "amount",
      enumVal: budgetLimitTypeEnum.LIMIT,
      description: "Track with a set limit, alerts on excess.",
    },
    {
      title: "no limit",
      enumVal: budgetLimitTypeEnum.NO_LIMIT,
      description: "Track freely, alert on total budget excess.",
    },
    {
      title: "none",
      enumVal: budgetLimitTypeEnum.NONE,
      description: "Exclude from tracking and budget calculations.",
    },
  ];

  // const mergedCategories = useMemo(() => {
  //   return data?.map((item) => {
  //     const match = categoryData.find(
  //       (value) => value?.headCategory == item?._id
  //     );
  //     return {
  //       ...item,
  //       spendLimitType: match?.spendLimitType || "",
  //     };
  //   });
  // }, [data, categoryData]);

  const handleTypeChange = (newType) => {
    if (isEdit) {
      setSelectedType(newType);
    } else {
      let updatedSubCategory = {};

      const modifyArr = selectedHeadCategory?.categories?.map((item) => {
        if (newType == budgetLimitTypeEnum.NONE) {
          updatedSubCategory = { ...updatedSubCategory, [item?._id]: 0 };
        }
        return {
          category: item?._id,
          spendLimitType: item?.spendLimitType || budgetLimitTypeEnum.NO_LIMIT,
          maxAmount:
            newType == budgetLimitTypeEnum.NONE ? 0 : item?.maxAmount || 0,
        };
      });

      dispatch(
        setSubCategoryAmounts({
          ...subCategoryAmounts,
          ...updatedSubCategory,
        })
      );

      dispatch(
        setHeadCategoryAmounts({
          ...headCategoryAmounts,
          [selectedHeadCategory?.headCategory]: 0,
        })
      );

      setSelectedData({
        headCategoryId: selectedHeadCategory?.headCategory,
        data: {
          headCategory: selectedHeadCategory?.headCategory,
          spendLimitType: newType,
          categories: modifyArr,
        },
      });

      // dispatch(addCategory({ ...item, spendLimitType: newType }));
      // dispatch(
      //   addUpdateHeadCategory({
      //     headCategoryId: item?.headCategory,
      //     data: {
      //       headCategory: item?.headCategory,
      //       spendLimitType: newType,
      //       categories: modifyArr,
      //     },
      //   })
      // );
    }
  };

  const handleSave = async () => {
    if (isEdit) {
      let updatedSubCategory = {};

      const modifyArr = editData?.categories?.map((item) => {
        if (selectedType == budgetLimitTypeEnum.NONE) {
          updatedSubCategory = { ...updatedSubCategory, [item?._id]: 0 };
        }
        return {
          category: item?.category?._id,
          spendLimitType: item?.spendLimitType || budgetLimitTypeEnum.NO_LIMIT,
          maxAmount:
            selectedType == budgetLimitTypeEnum.NONE ? 0 : item?.maxAmount || 0,
        };
      });

      dispatch(
        setSubCategoryAmounts({
          ...subCategoryAmounts,
          ...updatedSubCategory,
        })
      );

      const response = await dispatch(
        updateBudgetThunk({
          id: detailsData?._id,
          values: {
            headCategories: [
              {
                headCategory: editData?.headCategory?._id,
                spendLimitType: selectedType,
                maxAmount:
                  selectedType == budgetLimitTypeEnum.LIMIT
                    ? editData?.maxAmount
                    : 0,
                categories: modifyArr,
              },
            ],
          },
        })
      );
      if (updateBudgetThunk?.fulfilled.match(response)) {
        await dispatch(budgetDetailsThunk(detailsData?._id));
        onSuccess && onSuccess();
        closeModal();
      }
    } else {
      dispatch(addUpdateHeadCategory(selecteddata));
      closeModal();
    }
  };

  useEffect(() => {
    setSelectedType(editData?.spendLimitType);
  }, [editData]);

  useEffect(() => {
    !isEdit &&
      setSelectedData(() => ({
        data: { spendLimitType: selectedHeadCategory?.spendLimitType },
      }));
  }, []);

  return (
    <ModelWrapper
      show={isOpen}
      onHide={closeModal}
      className="modal-650px responsive"
      title={`Select Type`}
      backButton
    >
      <Modal.Body ref={modalBodyRef} className="pb-0">
        <ul className="p-0 m-0 d-flex flex-column gap-3">
          {typeData?.map((item, index) => {
            const title = item?.title;
            const enumVal = item?.enumVal;
            const description = item?.description || "";
            const isActive = selecteddata;
            // const isActive = selectedHeadCategory;

            return (
              <li
                key={index}
                className={` ${
                  index + 1 == typeData?.length ? "" : "border-bottom"
                } border-dark-white-color pb-3 cursor-pointer`}
                onClick={() => handleTypeChange(enumVal)}
              >
                <div className="d-flex align-items-center justify-content-between text-capitalize">
                  <span>{title}</span>
                  <Form.Check
                    checked={
                      (
                        isEdit
                          ? enumVal == selectedType
                          : isActive?.data?.spendLimitType == enumVal &&
                            isActive?.data?.spendLimitType !== ""
                      )
                        ? true
                        : false
                    }
                    className="square-check text-color-light-gray fs-18 ms-auto ms-4"
                    type={"checkbox"}
                    // label={`select all account`}
                    onChange={() => handleTypeChange(enumVal)}
                  />
                </div>
                {(
                  isEdit
                    ? enumVal == selectedType
                    : isActive?.spendLimitType == enumVal &&
                      isActive?.spendLimitType !== ""
                ) ? (
                  <span
                    className={`d-flex gap-2 align-items-center client-section-bg-color p-2 br-8 text-color-monsoon fs-15 mt-2`}
                  >
                    <i className="ri-information-line fs-21"></i>
                    {description}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Modal.Body>
      <Modal.Footer className="pt-0">
        <Button
          onClick={handleSave}
          type="submit"
          disabled={actionLoading || loading}
          className="primary-btn w-100"
        >
          {actionLoading || loading ? "Saving..." : "Save"}
        </Button>
      </Modal.Footer>
    </ModelWrapper>
  );
};

BudgetLimitType.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  editData: PropTypes.object,
};

export default memo(BudgetLimitType);
