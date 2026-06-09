import { memo, useCallback, useState } from "react";
import { formateAmount } from "../../../helpers/commonFunctions";
import { Button } from "react-bootstrap";
import {
  budgetDetailsThunk,
  budgetTransactionsThunk,
  getBudgetThunk,
  rolloverStatusThunk,
} from "../../../store/actions";
import { budgetRolloverUserResponse } from "../../../helpers/enum";
import useConfirmationAlert from "../sweetAlerts/ConfirmationAlert";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import CommonDeleteModal from "../modals/deleteModals/CommonDeleteModal";

const Rollover = ({ currencySymbol }) => {
  const dispatch = useDispatch();
  const { filterData, actionLoading, detailsData } = useSelector(
    (store) => store.Budget
  );

  const [isAcceptModal, setIsAcceptModal] = useState(false);
  const [isDeclineModal, setIsDeclineModal] = useState(false);

  const rolloverAmount = detailsData?.rollover?.generatedAmount;
  // const rolloverAcceptedAmount = detailsData?.rollover?.acceptedAmount;
  const rolloverResponse = detailsData?.rollover?.userResponse;

  const declineConfirmation = useConfirmationAlert({
    icon: "warning",
    title: "Decline rollover ",
    text: "Are you sure you want to Decline rollover? This change cannot be undone.",
    confirmButtonText: "Decline Rollover Budget",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Rollover Declined.",
  });

  const acceptConfirmation = useConfirmationAlert({
    icon: "warning",
    title: "Accept rollover ",
    text: "Are you sure you want to Accept rollover? This change cannot be undone.",
    confirmButtonText: "Accept Rollover Budget",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Rollover Accepted.",
  });

  const handleDecline = async () => {
    // declineConfirmation({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(
    //       rolloverStatusThunk({
    //         id: detailsData?._id,
    //         values: {
    //           userResponse: budgetRolloverUserResponse.DECLINED,
    //         },
    //       })
    //     );
    //     if (rolloverStatusThunk.fulfilled.match(response)) {
    //       !actionLoading &&
    //         (await dispatch(budgetDetailsThunk(detailsData?._id)));
    //       return true;
    //     }
    //   },
    // });
    setIsDeclineModal(true);
  };

  const handleAccept = async () => {
    // acceptConfirmation({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(
    //       rolloverStatusThunk({
    //         id: detailsData?._id,
    //         values: {
    //           userResponse: budgetRolloverUserResponse.ACCEPTED,
    //         },
    //       })
    //     );
    //     if (rolloverStatusThunk.fulfilled.match(response)) {
    //       !actionLoading &&
    //         (await dispatch(budgetDetailsThunk(detailsData?._id)));
    //       await dispatch(
    //         budgetTransactionsThunk({
    //           id: detailsData?._id,
    //           values: { page: 1, ...filterData },
    //         })
    //       );
    //       return true;
    //     }
    //   },
    // });
    setIsAcceptModal(true);
  };

  const handleConfirmAccept = useCallback(async () => {
    const response = await dispatch(
      rolloverStatusThunk({
        id: detailsData?._id,
        values: {
          userResponse: budgetRolloverUserResponse.ACCEPTED,
        },
      })
    );
    if (rolloverStatusThunk.fulfilled.match(response)) {
      !actionLoading && (await dispatch(budgetDetailsThunk(detailsData?._id)));
      await dispatch(
        budgetTransactionsThunk({
          id: detailsData?._id,
          values: { page: 1, ...filterData },
        })
      );
      return true;
    }
  }, [actionLoading, detailsData, dispatch, filterData]);

  const handleConfirmDecline = useCallback(async () => {
    const response = await dispatch(
      rolloverStatusThunk({
        id: detailsData?._id,
        values: {
          userResponse: budgetRolloverUserResponse.DECLINED,
        },
      })
    );
    if (rolloverStatusThunk.fulfilled.match(response)) {
      !actionLoading && (await dispatch(budgetDetailsThunk(detailsData?._id)));
      return true;
    }
  }, [actionLoading, detailsData, dispatch]);

  const handleCloseAcceptModal = useCallback(() => {
    setIsAcceptModal(false);
  }, []);

  const handleCloseDeclineModal = useCallback(() => {
    setIsDeclineModal(false);
  }, []);

  return (
    <div className="text-center">
      <div className="mt-3">
        <span className="text-color-monsoon fs-16">New Result</span>
        <h5 className="fs-24 mt-2 mb-0">
          {currencySymbol + formateAmount({ price: rolloverAmount })}
        </h5>
        <span className="text-color-monsoon fs-16">Left of Budget</span>
        <span className="text-color-monsoon px-5 fs-16 mt-3 d-block">
          Do you want to move the result over to this period?
        </span>
      </div>
      <div className="d-flex align-items-center gap-3 mt-4">
        <Button
          disabled={actionLoading}
          onClick={handleDecline}
          className="w-100 admin-primary-bg-btn br-10 text-color-monsoon"
        >
          No Thanks
        </Button>
        <Button
          disabled={actionLoading}
          onClick={handleAccept}
          className="w-100 light-primary-btn br-10"
        >
          Yes
        </Button>
      </div>

      <CommonDeleteModal
        isOpen={isAcceptModal}
        onClose={handleCloseAcceptModal}
        backdropClassName={"backdrop-upper"}
        content={{ description: "" }}
        onConfirm={handleConfirmAccept}
        loading={actionLoading}
      />

      <CommonDeleteModal
        isOpen={isDeclineModal}
        onClose={handleCloseDeclineModal}
        backdropClassName={"backdrop-upper"}
        content={{ description: "" }}
        onConfirm={handleConfirmDecline}
        loading={actionLoading}
      />
    </div>
  );
};

export default memo(Rollover);
