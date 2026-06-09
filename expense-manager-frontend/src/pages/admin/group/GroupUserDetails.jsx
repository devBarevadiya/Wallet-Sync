import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getGroupDetailsThunk } from "../../../store/group/thunk";
import { getAccountThunk } from "../../../store/actions";
import SettingLayout from "../settings/Layout";
import { Table } from "react-bootstrap";
import DynamicLordIcon from "../../../components/DynamicLordIcon";
import { Image } from "../../../data/images";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import TableTitle from "../../../components/admin/pageTitle/TableTitle";
import { groupAccessEnum } from "../../../helpers/enum";

const GroupUserDetails = () => {
  const { id } = useParams();
  //   const nav = useNavigate();
  const { singleData, singleLoading } = useSelector((store) => store.Group);
  const { data } = useSelector((store) => store.Account);
  const { user } = useSelector((store) => store.Auth);

  const icon = singleData?.icon
    ? import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL + singleData?.icon
    : Image.groupSharingImg;

  const currentUser = singleData?.members?.filter(
    (item) => item?.user?._id == user?._id
  )?.[0];
  const members = singleData?.members?.filter((item) => item?.user) || [];
  const dispatch = useDispatch();

  const titleFormatter = (value) => {
    const splitData = value?.split("_");
    return splitData?.join(" ");
  };

  useEffect(() => {
    (async () => {
      if (id) {
        const response = await dispatch(getGroupDetailsThunk(id));
        if (getGroupDetailsThunk.fulfilled.match(response)) {
          // if (response.payload.data?.createBy?._id !== user._id) {
          //   nav(ADMIN.SETTINGS.GROUP_SHARING.PATH);
          // }
        }
      }
    })();
    if (!data?.length) {
      dispatch(getAccountThunk());
    }
  }, []);

  return (
    <>
      <div className="pt-4">
        <PageTitle
          // filterButton={true}
          // setCanvas={() => setCanvas(true)}
          title="Group Sharing"
          subTitle="Explain the steps for setting up a new group"
          isButton={false}
          // onSuccess={getTransactionPara}
        />

        <TableTitle
          // count={data?.length}
          title="Create Group"
          // buttonContent="Add Payee"
          // onClick={() => setIsModal(true)}
        />

        {/* <SettingLayout> */}
        <div
          className="p-3 responsive bg-white rounded-bottom-4 border common-border-color border-top-0"
          // style={{ minHeight: `calc(100% - (63px + 50px))` }}
          style={{ minHeight: `calc(100vh - (80px + 218px))` }}
        >
          <div
            className={`text-center ${singleLoading ? " opacity-loading" : ""}`}
          >
            <img
              src={icon}
              className="wh-80px border border-3 border-color-light-primary br-18 mx-auto d-block bg-color-primary-10 object-fit-cover"
              alt=""
            />
            <h5 className="mt-2 fs-20 text-capitalize m-0 text-wrap text-break">
              {singleData?.title}
            </h5>
            <span className="text-color-light-gray fs-14">
              {currentUser?.accounts?.length}{" "}
              {currentUser?.accounts?.length > 1 ? "Accounts" : "Account"}
            </span>
          </div>
          <div>
            {!singleLoading ? (
              <Table responsive className="align-middle">
                <thead>
                  <tr>
                    <th className="text-color-light-gray fs-16">Account</th>
                    <th className="text-color-light-gray fs-16 text-end">
                      Permission
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentUser?.accounts?.map((item, index) => {
                    const permission = item?.permission;
                    const latter = permission?.slice(1);
                    const title = item?.account?.title;
                    return (
                      permission !== groupAccessEnum.NO_ACCESS && (
                        <tr key={index}>
                          <td
                            className={`py-4 ${
                              currentUser?.accounts?.length == index + 1
                                ? "border-0"
                                : ""
                            }`}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={Image.groupSharingImg}
                                className="h-50px w-50px  border border-2 border-color-light-primary bg-color-primary-10 br-12"
                                alt=""
                              />
                              <div className="">
                                <h6 className="fs-15 m-0 text-truncate max-w-300px">
                                  {title}
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td
                            className={`py-4 text-end ${
                              currentUser?.accounts?.length == index + 1
                                ? "border-0"
                                : ""
                            }`}
                          >
                            <h6 className="fs-14 client-section-bg-color d-inline px-3 py-2 br-8 text-nowrap">
                              <span>{permission?.[0]}</span>
                              <span className="text-lowercase">
                                {titleFormatter(latter)}
                              </span>
                            </h6>
                          </td>
                        </tr>
                      )
                    );
                  })}
                </tbody>
              </Table>
            ) : null}

            {!singleLoading && !members?.length ? (
              <DynamicLordIcon
                coverClass="bg-white"
                icon="fqbvgezn"
                subTitle="No members found for the this group"
                title="Oops! No members yet!!"
              />
            ) : null}

            {}
          </div>
        </div>
        {/* modal */}
        {/* </SettingLayout> */}
      </div>
    </>
  );
};

export default GroupUserDetails;
