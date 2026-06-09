import { Col, Form, Offcanvas, Row, Table } from "react-bootstrap";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import { sortByOptions } from "../../../data/admin/accounts";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { getAccountThunk } from "../../../store/actions";
import { useNavigate } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import { BALANCE } from "../../../routes/AdminRoutes";
import DynamicLordIcon from "../../../components/DynamicLordIcon";
import { clearSingleData } from "../../../store/account/slice";
import { clearDashboardData } from "../../../store/dashboard/slice";
import { clearTransitionRecords } from "../../../store/transaction/slice";
import { formateAmount, isPremium } from "../../../helpers/commonFunctions";
import PropTypes from "prop-types";
import { addAccount, subscriptionTypeEnum } from "../../../helpers/enum";
import AccountTypeModel from "../../../components/admin/modals/AccountTypeModel";
import AddEditAccountModal from "../../../components/admin/modals/AddEditAccountModal";
import PremiumModal from "../../../components/admin/modals/PremiumModal";
import AlertModal from "../../../components/admin/modals/AlertModal";
import NoData from "../../../components/admin/NoData";

const Accounts = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [canvas, setCanvas] = useState(false);
  const { data, accessLimit } = useSelector((store) => store.Account);
  const { singleUserGroupData } = useSelector((store) => store.Group);
  const [sortBy, setSortBy] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [dataArray, setDataArray] = useState([]);
  const [accountTypeModel, setAccountTypeModel] = useState(false);
  const [premiumModel, setPremiumModel] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const isActiveData = Object?.keys(singleUserGroupData)?.length ? true : false;
  const isAdmin = isActiveData
    ? user?._id == singleUserGroupData?.createBy?._id
    : true;

  // Sorting functions
  const sortingFunctions = {
    "A-Z": (a, b) => a.title.localeCompare(b.title),
    "Z-A": (a, b) => b.title.localeCompare(a.title),
    "Lowest First": (a, b) => a.balance - b.balance,
    "Highest First": (a, b) => b.balance - a.balance,
    "": () => 0,
  };

  const handleFilter = (sortByValue, searchValue) => {
    setSortBy(sortByValue);
    setSearchValue(searchValue);
    const searchedDataArray = data.filter((ele) => {
      return (
        ele.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        ele.accountType.title.toLowerCase().includes(searchValue.toLowerCase())
      );
    });

    const sortedSearchedData = [...searchedDataArray].sort(
      sortingFunctions[sortByValue]
    );

    setDataArray(sortedSearchedData);
  };

  const accountTypeModal = useCallback(() => {
    if (isPremium() || data.length < accessLimit) {
      setAccountTypeModel(true);
    } else {
      setPremiumModel(true);
    }
  }, [accessLimit, data, user]);

  const handleCloseSelectAccount = () => {
    setSelectedAccountType("");
  };

  const onSuccess = useCallback(() => {
    dispatch(getAccountThunk());
  }, []);

  const handleCloseAlert = useCallback(() => {
    setAlertModal(false);
  }, []);

  const handleOpenAlert = useCallback(() => {
    setAlertModal(true);
  }, []);

  useEffect(() => {
    setDataArray(data);
  }, [data]);

  useEffect(() => {
    dispatch(getAccountThunk());
    dispatch(clearDashboardData());
    dispatch(clearSingleData());
    dispatch(clearTransitionRecords());
  }, [dispatch]);

  return (
    <>
      <div className={`account-page  pt-4`}>
        <div className={`mb-3`}>
          <PageTitle
            onSuccess={() => dispatch(getAccountThunk())}
            filterButton={true}
            setCanvas={setCanvas}
            title="Accounts"
            subTitle="Manage and track all your financial accounts in one place."
            buttonContent="Add Account"
            onButtonClick={isAdmin ? accountTypeModal : handleOpenAlert}
            isAdminRequired={false}
          />
        </div>
        <Row className={`px-1 accounts-layout responsive`}>
          <Col lg={5} xl={4} xxl={3} className={`d-none d-lg-block px-2`}>
            <div
              className={`h-100 px-20px py-3 border common-border-color rounded-4 bg-white`}
            >
              <div className={`mb-3`}>
                <span className={`lh-base fw-medium fs-22`}>Filter</span>
              </div>
              <Form.Group className={`position-relative mb-3`}>
                <i className="position-absolute ps-12px start-0 top-50 translate-middle-y ri-search-line fs-18 text-color-gray"></i>
                <Form.Control
                  value={searchValue}
                  placeholder="search..."
                  name="search"
                  onChange={(e) => {
                    handleFilter(sortBy, e.target.value);
                  }}
                  className={`common-border-color text-color-dusty-gray pe-5 ps-40px fs-16 responsive`}
                />
                {searchValue && (
                  <i
                    onClick={() => handleFilter(sortBy, "")}
                    className="ri-close-fill fw-medium fs-18 cursor-pointer position-absolute top-50 translate-middle end-0 text-end"
                  ></i>
                )}
              </Form.Group>
              <Form.Group>
                <Form.Label className="text-capitalize fw-medium fs-16 lh-base text-dark">
                  Sort By
                </Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => {
                    handleFilter(e.target.value, searchValue);
                  }}
                  className={`common-border-color text-color-dusty-gray pe-5 py-0 fs-16 responsive text-capitalize`}
                >
                  {sortByOptions?.map((item, index) => {
                    const title = item.title;
                    const value = item.value;
                    return (
                      <option key={index} value={value}>
                        {title}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            </div>
          </Col>
          <Col lg={7} xl={8} xxl={9} className={`px-2`}>
            <div
              className={`h-100 position-relative px-20px py-1 overflow-y-scroll overflow-scroll-design border common-border-color rounded-4 bg-white account-right-part`}
            >
              {!dataArray?.length ? (
                // <DynamicLordIcon
                //   coverClass="bg-white"
                //   icon="bgebyztw"
                //   subTitle="Create an account to get started!"
                //   title="Oops! No Account Found!"
                // />
                <NoData
                  className="mt-0 rounded-0 border-0 layout-content-without-table-height rounded-bottom-4 w-100"
                  title="No Accounts Found"
                  description="You haven’t added any accounts yet. Link or  create one to get started"
                  buttonContent="Add Account"
                  onButtonClick={accountTypeModal}
                />
              ) : (
                <Table responsive className="account-table border-0 mb-0">
                  <tbody>
                    {dataArray?.map((ele, index) => {
                      const id = ele?._id;
                      const icon =
                        import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                        ele?.accountType?.icon;
                      const title = ele?.title;
                      const accountTypeTitle = ele?.accountType?.title;
                      const symbol = ele?.currency?.symbol;
                      const balance = ele?.balance;
                      return (
                        <tr key={id}>
                          <td
                            className={`min-w-75px w-75px border-bottom border-dark-white-color text-truncate border-0 p-3 ps-2`}
                          >
                            <div
                              onClick={() =>
                                navigate(
                                  ADMIN.ACCOUNTS.PATH + `/${id}` + BALANCE
                                )
                              }
                              className={`cursor-pointer br-18 light-primary-shadow  aspect-square w-50px h-50px`}
                            >
                              <img
                                src={icon}
                                alt={`account-icon-${index}`}
                                className={`h-100 w-100 object-fit-cover br-12`}
                              />
                            </div>
                          </td>
                          <td
                            className={`border-bottom border-dark-white-color max-w-300px border-0 p-3 ps-0`}
                          >
                            <div
                              onClick={() =>
                                navigate(
                                  ADMIN.ACCOUNTS.PATH + `/${id}` + BALANCE
                                )
                              }
                              className={`text-truncate cursor-pointer`}
                            >
                              <span
                                className={`fs-18 fw-medium lh-base mb-0 text-capitalize`}
                              >
                                {title}
                              </span>
                              <p
                                className={`fs-14 lh-base fw-normal text-color-monsoon mb-0`}
                              >
                                {accountTypeTitle}
                              </p>
                            </div>
                          </td>
                          <td
                            className={`border-bottom border-dark-white-color border-0 p-3 pe-0`}
                          >
                            <div
                              onClick={() =>
                                navigate(
                                  ADMIN.ACCOUNTS.PATH + `/${id}` + BALANCE
                                )
                              }
                              className={`cursor-pointer d-flex align-items-center justify-content-end`}
                            >
                              <span
                                className={`fw-semibold ${
                                  balance > 0
                                    ? "text-color-light-green"
                                    : "text-color-invalid"
                                }`}
                              >
                                {balance === 0
                                  ? symbol + 0
                                  : balance > 0
                                  ? symbol + formateAmount({ price: balance })
                                  : "-" +
                                    symbol +
                                    String(
                                      formateAmount({ price: balance })
                                    ).split("-")[1]}
                              </span>
                              <i className="fs-2 fw-normal ri-arrow-right-s-line"></i>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </div>
          </Col>
        </Row>
        <Offcanvas
          className={`max-w-300px`}
          show={canvas}
          onHide={() => setCanvas(false)}
        >
          <Offcanvas.Header
            className={`border-bottom common-border-color`}
            closeButton
          >
            <Offcanvas.Title>Filter</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="responsive">
            <>
              <div className={`mb-3`}>
                <span className={`lh-base fw-medium fs-22`}>Filter</span>
              </div>
              <Form.Group className={`position-relative mb-3`}>
                <i className="position-absolute ps-12px start-0 top-50 translate-middle-y ri-search-line fs-18 text-color-gray"></i>
                <Form.Control
                  value={searchValue}
                  placeholder="search..."
                  name="search"
                  onChange={(e) => {
                    handleFilter(sortBy, e.target.value);
                  }}
                  className={`common-border-color text-color-dusty-gray pe-5 ps-40px fs-16 responsive`}
                />
                {searchValue && (
                  <i
                    onClick={() => handleFilter(sortBy, "")}
                    className="ri-close-fill fw-medium fs-18 cursor-pointer position-absolute top-50 translate-middle end-0 text-end"
                  ></i>
                )}
              </Form.Group>
              <Form.Group>
                <Form.Label className="text-capitalize fw-medium fs-16 lh-base text-dark">
                  Sort By
                </Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => {
                    handleFilter(e.target.value, searchValue);
                  }}
                  className={`common-border-color text-color-dusty-gray pe-5 py-0 fs-16 responsive text-capitalize`}
                >
                  {sortByOptions?.map((item, index) => {
                    const title = item.title;
                    const value = item.value;
                    return (
                      <option key={index} value={value}>
                        {title}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            </>
          </Offcanvas.Body>
        </Offcanvas>
      </div>

      <AccountTypeModel
        isOpen={accountTypeModel}
        onSelectValue={(enumValue) => setSelectedAccountType(enumValue)}
        onHide={() => setAccountTypeModel(false)}
      />

      <AddEditAccountModal
        isOpen={selectedAccountType == addAccount}
        onHide={handleCloseSelectAccount}
        item={{}}
        onSuccess={onSuccess}
        // onDelete={() => dispatch(analyticsThunk(chartData))}
      />

      <PremiumModal
        isShow={premiumModel}
        onHide={() => setPremiumModel(false)}
      />

      <AlertModal
        title={isAdmin ? "" : "You have no access"}
        description={
          isAdmin
            ? ""
            : "Account creation is restricted. Please contact to admin"
        }
        cancelBtnContent={isAdmin ? "" : "Close"}
        confirmBtnContent={isAdmin ? "" : "Okay"}
        onClose={handleCloseAlert}
        isOpen={alertModal}
        onConfirm={() => {
          isAdmin ? setAccountTypeModel(true) : null;
          handleCloseAlert();
        }}
      />
    </>
  );
};

Accounts.propTypes = {
  user: PropTypes.object,
};

export default Accounts;
