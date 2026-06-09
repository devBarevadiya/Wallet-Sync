import { Placeholder } from "react-bootstrap";

const NotificationLoading = () => {
  return (
    <div className="d-flex align-items-center justify-content-between">
      <div className="d-flex flex-column">
        <Placeholder animation="glow">
          <Placeholder className={`bg-color-gray br-10 h-100 w-100px`} xs={2} />
        </Placeholder>
        <Placeholder animation="glow">
          <Placeholder className={`bg-color-gray br-10 h-100 w-180px`} xs={2} />
        </Placeholder>
      </div>
      <Placeholder animation="glow">
        <Placeholder
          className={`bg-color-gray br-10 h-100 w-50px h-30px`}
          xs={2}
        />
      </Placeholder>
    </div>
  );
};

export default NotificationLoading;
