import { Placeholder } from "react-bootstrap";

const RemainListLoading = () => {
  return (
    <ul className="p-0 m-0 d-flex flex-column gap-3">
      {Array(10)
        .fill({})
        .map((_, index) => {
          return (
            <li
              key={index}
              className={` ${
                index + 1 == 10
                  ? ""
                  : "border-bottom border-dark-white-color pb-3"
              }`}
            >
              <div
                className={`d-flex align-items-center justify-content-between`}
              >
                <div className="d-flex gap-2 align-items-center">
                  <Placeholder animation="glow">
                    <Placeholder
                      className={`bg-color-gray br-10 h-50px w-50px`}
                      xs={2}
                    />
                  </Placeholder>
                  <div className={`w-100 d-flex flex-column gap-1`}>
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
                </div>
                <Placeholder animation="glow">
                  <Placeholder
                    className={`bg-color-gray br-10 h-100 w-100px`}
                    xs={2}
                  />
                </Placeholder>
              </div>
              <Placeholder animation="glow">
                <Placeholder
                  className={`bg-color-gray br-10 h-12px w-100 mt-3`}
                  xs={2}
                />
              </Placeholder>
            </li>
          );
        })}
    </ul>
  );
};

export default RemainListLoading;
