import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { budgetLimitTypeEnum } from "../../../../helpers/enum";
import {
  setSubCategory,
  setSubCategoryAmounts,
} from "../../../../store/budget/slice";
import ModelWrapper from "../../../ModelWrapper";
import { Button, Form, Modal } from "react-bootstrap";
import {
  budgetDetailsThunk,
  updateBudgetThunk,
} from "../../../../store/actions";
import PropTypes from "prop-types";
import { useModalScroll } from "../../../../helpers/customHooks";

const CategoryBudgetLimitTypeModal = ({
  onClose,
  isOpen,
  data = {},
  editData = {},
}) => {
  const {
    selectedSubCategory,
    selectedHeadCategory,
    actionLoading,
    loading,
    subCategoryAmounts,
  } = useSelector((store) => store.Budget);
  const [newType, setNewType] = useState("");
  const dispatch = useDispatch();
  const { detailsData } = useSelector((store) => store.Budget);
  const [selectedData, setSelectedData] = useState({});
  const isEdit = useMemo(() => Object?.keys(editData)?.length > 0, [editData]);
  const memoEditData = useMemo(() => editData, [editData]);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });
  const closeModal = useCallback(() => {
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
  ];

  const handleTypeChange = useCallback(
    (item, newType) => {
      if (isEdit) {
        setNewType(newType);
      } else {
        if (newType !== budgetLimitTypeEnum.LIMIT) {
          dispatch(
            setSubCategoryAmounts({ ...subCategoryAmounts, [data?._id]: 0 })
          );
        }

        setSelectedData({
          headCategoryId: selectedHeadCategory?.headCategory,
          subCategoryId: data?._id,
          data: {
            category: data?._id,
            spendLimitType: newType,
          },
        });
        // dispatch(
        //   setSubCategory({
        //     headCategoryId: selectedHeadCategory?.headCategory,
        //     subCategoryId: data?._id,
        //     data: {
        //       category: item?.category,
        //       spendLimitType: newType,
        //     },
        //   })
        // );
      }
    },
    [isEdit, selectedHeadCategory, data, subCategoryAmounts, dispatch]
  );

  const handleSave = async () => {
    if (isEdit) {
      const response = await dispatch(
        updateBudgetThunk({
          id: detailsData?._id,
          values: {
            headCategories: [
              {
                headCategory: memoEditData?.headCategory?.headCategory?._id,
                spendLimitType: memoEditData?.headCategory?.spendLimitType,
                maxAmount: memoEditData?.headCategory?.maxAmount,
                categories: [
                  {
                    category: memoEditData?.category?.category?._id,
                    spendLimitType: newType,
                    maxAmount: memoEditData?.category?.maxAmount,
                  },
                ],
              },
            ],
          },
        })
      );
      if (updateBudgetThunk?.fulfilled.match(response)) {
        await dispatch(budgetDetailsThunk(detailsData?._id));
        closeModal();
      }
    } else {
      dispatch(setSubCategory(selectedData));
      closeModal();
    }
  };

  useEffect(() => {
    isEdit && setNewType(memoEditData?.category?.spendLimitType);
  }, [memoEditData]);

  useEffect(() => {
    !isEdit &&
      setSelectedData(() => ({
        data: { spendLimitType: selectedSubCategory?.spendLimitType },
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
            const isActive = selectedData;

            return (
              <li
                key={index}
                className={` ${
                  index + 1 == typeData?.length ? "" : "border-bottom"
                } border-dark-white-color pb-3 cursor-pointer`}
                onClick={() => handleTypeChange(isActive, enumVal)}
              >
                <div className="d-flex align-items-center justify-content-between text-capitalize">
                  <span>{title}</span>
                  <Form.Check
                    checked={
                      (isActive?.data?.spendLimitType == enumVal &&
                        isActive?.data?.spendLimitType !== "") ||
                      newType == enumVal
                        ? true
                        : false
                    }
                    className="square-check text-color-light-gray fs-18 ms-auto ms-4"
                    type={"checkbox"}
                    onChange={() => handleTypeChange(isActive, enumVal)}
                  />
                </div>
                {isActive?.spendLimitType == enumVal &&
                isActive?.spendLimitType !== "" ? (
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
          {actionLoading || loading ? "Saving.." : "Save"}
        </Button>
      </Modal.Footer>
    </ModelWrapper>
  );
};

CategoryBudgetLimitTypeModal.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  data: PropTypes.object,
  editData: PropTypes.object,
};

export default CategoryBudgetLimitTypeModal;
