import React from "react";
import { Placeholder } from "react-bootstrap";

const ListLoading = () => {
  return (
    <ul className="p-0 m-0 d-flex flex-column gap-3">
      {Array(10)
        .fill({})
        .map((_, index) => {
          return (
            <li
              key={index}
              className={`d-flex align-items-center ${
                index + 1 == 10
                  ? ""
                  : "border-bottom border-dark-white-color pb-3"
              }`}
            >
              <div className={`w-100 d-flex flex-column`}>
                <Placeholder animation="glow">
                  <Placeholder
                    className={`bg-color-gray br-10 h-100 w-180px`}
                    xs={2}
                  />
                </Placeholder>
                <Placeholder animation="glow">
                  <Placeholder
                    className={`bg-color-gray br-10 h-100 w-100px`}
                    xs={2}
                  />
                </Placeholder>
              </div>
              <Placeholder animation="glow">
                <Placeholder
                  className={`bg-color-gray br-10 h-100 w-100px`}
                  xs={2}
                />
              </Placeholder>
            </li>
          );
        })}
    </ul>
  );
};

export default ListLoading;
