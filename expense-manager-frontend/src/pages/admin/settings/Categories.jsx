import { useSelector } from "react-redux";
import SettingLayout from "./Layout";
import { Col, Row } from "react-bootstrap";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import { memo, useCallback, useMemo, useState } from "react";
import Category from "./modals/Category";
import { subscriptionTypeEnum } from "../../../helpers/enum";
import PremiumModal from "../../../components/admin/modals/PremiumModal";
import NoData from "../../../components/admin/NoData";
import {
  countCustomCategory,
  isPremium,
} from "../../../helpers/commonFunctions";

const Categories = () => {
  const { user } = useSelector((store) => store.Auth);
  const { categories, totalCounts, accessLimit } = useSelector(
    (state) => state.Category
  );
  const [openId, setOpenId] = useState("");
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [premiumModal, setPremiumModal] = useState(false);

  const handleModals = () => {
    if (isPremium() || countCustomCategory() < accessLimit) {
      setModal(true);
    } else {
      setPremiumModal(true);
    }
  };

  const removeToggleId = () => {
    setOpenId("");
  };

  const addToggleId = (id) => {
    setOpenId((prevOpenId) => (prevOpenId === id ? "" : id));
  };

  const handleEditCategory = (value) => {
    setModal(true);
    setEditData(value);
  };

  const CategoryCard = memo(({ id, icon, title, ele }) => {
    return (
      <Col
        className={`categories-boxes px-2 mb-3`}
        xs={12}
        sm={6}
        md={6}
        lg={12}
        xl={6}
        xxl={4}
        key={id}
      >
        <div className={`client-section-bg-color br-10 p-3`}>
          <div className={`d-flex align-items-center`}>
            <div
              onClick={() => handleEditCategory(ele)}
              className={`aspect-square icon min-w-55px w-55px br-10 overflow-hidden cursor-pointer`}
            >
              <img
                src={icon}
                alt={`icon-${id}`}
                className={`h-100 w-100 object-fit-cover`}
              />
            </div>
            <h4
              onClick={() => handleEditCategory(ele)}
              className={`ms-12px text-truncate max-w-170px responsive fs-17 text-capitalize fw-medium lh-base mb-0 cursor-pointer`}
            >
              {title}
            </h4>
            <div className={`ms-auto ps-3`}>
              <ToggleMenu
                rootClass={"category"}
                onClose={removeToggleId}
                onClick={() => addToggleId(id)}
                isOpen={openId == id}
              >
                <p
                  className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
                  onClick={() => handleEditCategory(ele)}
                >
                  Edit
                </p>
                {/* <p
          className="text-color-secondary m-0 fs-14 text-start cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
          // onClick={() => handleDeleteRecord(id)}
        >
          Delete
        </p> */}
              </ToggleMenu>
            </div>
          </div>
          {/* <Button
    className="mt-3 w-100 text-truncate primary-white-btn focus-bg-color-primary v-fit min-h-40px py-1 br-8 bg-white hover-bg-color-primary hover-text-color-white-i hover-text-color-white-span text-dark-primary d-flex align-items-center justify-content-center border common-border-color px-3 gap-1 text-capitalize"
    // onClick={onClick}
  >
    <i className="text-table-head-color ri-add-line fs-22"></i>
    <span
      className={`text-dark-primary fs-14 fw-normal lh-base`}
    >
      add category
    </span>
  </Button> */}
        </div>
      </Col>
    );
  }, []);
  CategoryCard.displayName = "CategoryCard";

  return (
    <SettingLayout
      // buttonContent="add category"
      // onClick={handleModals}
      pageTitleData={{
        buttonContent: "add category",
        onButtonClick: handleModals,
      }}
    >
      {categories?.length > 0 ? (
        <div className={`category p-3 pb-0`}>
          <Row className={`px-1`}>
            {categories.map((ele) => {
              const id = ele?._id;
              const title = ele?.title;
              const icon =
                import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL + ele?.icon;
              return (
                <CategoryCard
                  key={id}
                  id={id}
                  title={title}
                  icon={icon}
                  ele={ele}
                />
              );
            })}
          </Row>
        </div>
      ) : (
        <NoData
          className="mt-0 rounded-0 border-0 height-with-table-header rounded-bottom-4 w-100"
          title="No Category Found"
          description="You haven’t added any category yet. Link or create one to get started"
          buttonContent="Add Category"
          onButtonClick={handleModals}
        />
      )}
      <Category
        isOpen={modal}
        onHide={() => {
          setModal(false), setEditData({});
        }}
        data={editData}
      />
      <PremiumModal
        isShow={premiumModal}
        onHide={() => setPremiumModal(false)}
      />
    </SettingLayout>
  );
};

export default Categories;
