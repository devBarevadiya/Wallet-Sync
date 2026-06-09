import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  analyticsThunk,
  deleteAccountThunk,
  getAccountDetailsThunk,
} from "../../../store/actions";
import { Button } from "react-bootstrap";
import { subPagesNavItems } from "../../../data/admin/accounts";
import { ADMIN } from "../../../constants/routes";
import useConfirmationAlert from "../../../components/admin/sweetAlerts/ConfirmationAlert";
import DynamicLordIcon from "../../../components/DynamicLordIcon";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";
import {
  aggregateDates,
  getDateRange,
  isTransactionAction,
} from "../../../helpers/commonFunctions";
import ReactApexChart from "react-apexcharts";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";
import { analyticsTypeEnum } from "../../../helpers/enum";

const Balance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singleData, loading } = useSelector((store) => store.Account);
  const { user } = useSelector((store) => store.Auth);
  const { data: groupData, singleUserGroupData } = useSelector(
    (store) => store.Group
  );
  const { data } = useSelector((store) => store.Dashboard);
  const [selectedAccountType, setSelectedAccountType] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const { id } = useParams();
  const checkPermission = isTransactionAction({ id: id });
  const triggerDeleteAccount = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Account Delete",
    text: "Are you sure you want to delete this account? This change cannot be undone.",
    confirmButtonText: "Delete Account",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Account has been successfully deleted.",
  });

  const handleDeleteAccount = useCallback(() => {
    // triggerDeleteAccount({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(deleteAccountThunk(singleData?._id));
    //     if (deleteAccountThunk.fulfilled.match(response)) {
    //       navigate(ADMIN.ACCOUNTS.PATH);
    //       return true;
    //     }
    //   },
    // });
    setIsDelete(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(deleteAccountThunk(singleData?._id));
    if (deleteAccountThunk.fulfilled.match(response)) {
      navigate(ADMIN.ACCOUNTS.PATH);
      return true;
    }
    return false;
  }, [singleData, dispatch, navigate]);

  const handleEditAccount = () => {
    dispatch(getAccountDetailsThunk(id));
    dispatch(
      analyticsThunk({
        accounts: [id],
        BALANCE_TREND: {
          include: true,
          parameters: getDateRange(),
        },
      })
    );
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short" };
    return new Intl.DateTimeFormat("en-GB", options).format(
      new Date(dateString)
    );
  };

  const { seriesDate, dateData } = aggregateDates(
    data?.[analyticsTypeEnum.BALANCE_TREND]
  )?.reduce(
    (acc, value) => {
      acc.seriesDate.push(value?.balance);
      acc.dateData.push(formatDate(value?.date, "D MMM"));
      return acc;
    },
    { seriesDate: [], dateData: [] }
  ) || { seriesDate: [], dateData: [] };

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
      events: {
        dataPointMouseEnter: (event, chartContext, config) => {
          const balanceValue = series[0].data[config.dataPointIndex];
          // You can also set state or trigger any other action here
        },
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
        format: "DD MMM",
      },
      y: {
        formatter: (val) => `Balance: ${val}`,
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
    },
  };

  const handleCloseDeleteModal = useCallback(() => setIsDelete(false), []);

  useEffect(() => {
    if (Object.keys(singleData).length === 0)
      dispatch(getAccountDetailsThunk(id));
  }, [dispatch, id, singleData]);

  useEffect(() => {
    dispatch(
      analyticsThunk({
        accounts: [id],
        [analyticsTypeEnum.BALANCE_TREND]: {
          include: true,
          parameters: getDateRange(),
        },
      })
    );
  }, [dispatch, id]);

  return (
    <div className={`account-balance py-3 responsive`}>
      <div className={`mb-3`}>
        <PageTitle
          // onSuccess={useMemo(
          //   async () =>
          //     await dispatch(
          //       analyticsThunk({
          //         accounts: [id],
          //         BALANCE_TREND: {
          //           include: true,
          //           parameters: getDateRange(),
          //         },
          //       })
          //     ),
          //   [id]
          // )}
          title={"Accounts"}
          subTitle="In this report, you will find your wallet status."
        />
      </div>
      {singleData?._id ? (
        <>
          <div
            className={`bg-white border common-border-color pt-20px rounded-4`}
          >
            <div
              className={`d-flex align-items-center gap-3 px-20px overflow-auto overflow-scroll-design justify-content-between pb-20px position-relative divider`}
            >
              <div className={`d-flex align-items-center gap-3`}>
                <div
                  className={`br-21 w-65px min-w-65px aspect-square h-100 light-primary-shadow responsive-icon`}
                >
                  <img
                    src={
                      import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                      singleData?.accountType?.icon
                    }
                    alt={`account-icon-${singleData?._id}`}
                    className={`w-100 h-100 object-fit-cover br-12`}
                  />
                </div>
                <div className={`max-w-300px text-truncate`}>
                  <h4
                    className={`fs-17 fw-normal text-color-monsoon lh-base mb-0`}
                  >
                    Type
                  </h4>
                  <span
                    className={`text-capitalize fs-17 lh-base fw-medium text-dark mb-0`}
                  >
                    {singleData?.accountType?.title}
                    {/* {singleData?.accountType?.title} Type */}
                  </span>
                </div>
                <div className={`max-w-300px text-truncate`}>
                  <h4
                    className={`fs-17 fw-normal text-color-monsoon lh-base mb-0`}
                  >
                    Name
                  </h4>
                  <span
                    className={`text-capitalize fs-17 lh-base fw-medium text-dark mb-0`}
                  >
                    {singleData?.title}
                  </span>
                </div>
              </div>

              {checkPermission && (
                <div className={`d-flex align-items-center gap-2 action-icons`}>
                  <Button
                    className="me-1 bg-color-blue-10 border-color-blue br-10 h-40px aspect-square d-flex align-items-center justify-content-center hover-bg-blue-text-white text-color-blue transition"
                    onClick={() => setSelectedAccountType(true)}
                  >
                    <i className="ri-pencil-line fs-18 fw-medium lh-0"></i>
                  </Button>
                  <Button
                    className="bg-color-invalid-10 border-color-invalid br-10 h-40px aspect-square d-flex align-items-center justify-content-center hover-bg-invalid-text-white text-color-invalid transition"
                    onClick={handleDeleteAccount}
                  >
                    <i className="ri-delete-bin-line fs-18 fw-medium lh-0"></i>
                  </Button>
                </div>
              )}
            </div>
            <div
              className={`pt-3 d-flex align-items-center overflow-auto invisible-scrollbar gap-3 px-20px`}
            >
              {subPagesNavItems.map((ele, index) => {
                const title = ele.title;
                return (
                  <Button
                    onClick={() =>
                      navigate(
                        `${ADMIN.ACCOUNTS.PATH}/${singleData?._id}/${title}`
                      )
                    }
                    key={index}
                    className={`rounded-0 border-start-0 border-top-0 border-end-0 bg-transparent p-0 m-0 px-4 pb-2 hover-color-dark hover-border-color-primary transition border-2 ${
                      location.pathname.includes(title)
                        ? "text-dark-primary border-color-primary"
                        : "text-color-inactive border-transparent"
                    } fs-18 fw-medium lh-base text-capitalize`}
                  >
                    {title}
                  </Button>
                );
              })}
            </div>
          </div>
          <div
            className={`bg-white balance-chart-box border common-border-color pt-20px rounded-4 mt-3`}
          >
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={235}
            />
          </div>
        </>
      ) : (
        <DynamicLordIcon
          coverClass="admin-primary-bg"
          icon="bgebyztw"
          subTitle="No account details found for the provided ID."
          title="Oops! Account Not Found!"
        />
      )}
      <AddEditAccountModal
        isOpen={selectedAccountType}
        onHide={() => setSelectedAccountType(false)}
        item={singleData}
        onSuccess={handleEditAccount}
      />

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete Account",
          description: "Are you sure you want to delete the Account?",
        }}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </div>
  );
};

export default Balance;
