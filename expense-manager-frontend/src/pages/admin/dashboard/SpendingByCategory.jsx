import { memo } from "react";
import { transactionTypeEnum } from "../../../helpers/enum";

const SpendingByCategory = () => {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between ms-3 me-4 border-bottom common-border-color pb-2 pb-sm-3">
        <h6 className="p-0 m-0">Spending By Category</h6>
        <span>-</span>
      </div>
      <div className="d-flex gap-3 flex-column mt-3">
        {[1, 1, 1].map((item, index) => {
          const icon =
            "https://guardianshot.blr1.digitaloceanspaces.com/expense/groceries/811213c6-0978-466f-a8ed-2e5087bee86b.png";
          const title = "Shopping";
          const type = transactionTypeEnum.INCOME;
          const amount = 100000;
          const currencySymbol = "₹";
          const transactions = 2;
          return (
            <div
              key={index}
              className="d-flex align-items-center justify-content-between"
            >
              <div className="d-flex gap-2 align-items-center">
                <img
                  src={icon}
                  alt=""
                  className="w-50px h-50px object-fit-cover br-12"
                />
                <div>
                  <h6 className="m-0 p-0 fs-14">{title}</h6>
                  <span className="fs-12 text-color-monsoon">
                    {transactions || 0} Transactions
                  </span>
                </div>
              </div>
              <span
                className={`${
                  type == transactionTypeEnum.INCOME
                    ? "text-color-light-green"
                    : "text-color-invalid"
                } fs-14 fw-medium d-flex align-items-center gap-1`}
              >
                {type == transactionTypeEnum.INCOME ? "+ " : "- "}
                {currencySymbol + amount}
                <i className="ri-arrow-right-s-line fs-28"></i>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(SpendingByCategory);
