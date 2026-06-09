import PropTypes from "prop-types";
import { Image } from "../../../data/images";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { setChartOrderHide } from "../../../store/dashboard/slice";
import { formateAmount } from "../../../helpers/commonFunctions";

const BalanceByCurrency = ({ data = [], enumTitle = "" }) => {
  const [isOpen, setIsOpen] = useState();

  const dispatch = useDispatch();
  const totalAmount = data?.reduce((acc, value) => acc + value?.balance, 0);
  const color = ["#6BC127", "#C75DE1", "#FFB800"];

  const sortedData = [...data]
    ?.sort((a, b) => b?.balance - a?.balance)
    ?.slice(0, 3);
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between border-bottom border-dark-white-color pb-2 pb-sm-3">
        <h6 className="p-0 m-0 fs-18">Balance by Currencies</h6>
        <span>
          <ToggleMenu
            onClose={() => setIsOpen(false)}
            onClick={() => setIsOpen((pre) => !pre)}
            isOpen={isOpen}
          >
            <p
              className="text-color-secondary m-0 fs-14 cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
              onClick={() => dispatch(setChartOrderHide(enumTitle))}
            >
              Hide
            </p>
          </ToggleMenu>
        </span>
      </div>
      {sortedData?.length ? (
        <ul className="p-0 m-0">
          {sortedData?.map((item, index) => {
            const currency = item?.currency;
            const symbole = item?.symbol || "";
            const balance = item?.balance;
            const widthInPercent = Math.floor((balance / totalAmount) * 100);
            return (
              <li className={`${sortedData?.length == index+1 ? "pt-3" : "border-bottom border-dark-white-color py-3"}`} key={index}>
                <div className="d-flex align-items-center justify-content-between ms-1 me-1">
                  <h4 className="p-0 m-0 fs-14 d-flex align-items-center gap-2">
                    {" "}
                    <span
                      className="p-2 br-5"
                      style={{ backgroundColor: `${color[index]}` }}
                    ></span>{" "}
                    {currency}
                  </h4>
                  <span className="fs-14 fw-medium">
                    {symbole + formateAmount({ price: item?.balance })}
                  </span>
                </div>
                <span className="d-block w-100 admin-primary-bg mt-3 mx-1 br-5 overflow-hidden">
                  <span
                    className="d-block br-5"
                    style={{
                      backgroundColor: `${color[index]}`,
                      width: `${widthInPercent || 0}%`,
                      height: "11px"
                    }}
                  ></span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="h-100 d-flex flex-column align-items-center justify-content-center">
          <img
            src={Image.noExpenseImg}
            className="mx-auto d-block w-150px mt-2"
            alt=""
            style={{ display: "inline-block" }}
          />
          <p className="text-color-light-gray mt-2 fs-14 mb-0">
            There are no data in the selected time interval.
          </p>
        </div>
      )}
    </div>
  );
};

BalanceByCurrency.propTypes = {
  data: PropTypes.array,
  enumTitle: PropTypes.string,
};

export default memo(BalanceByCurrency);
