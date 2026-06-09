import { Image } from "../../data/images";
import { reviewData } from "../../data/reviews";

const Reviews = () => {
  return (
    <div className="infiniteScrollReviewContainer">
      <div className="scroll">
        {reviewData?.map((item, index) => {
          const description = item?.description;
          const name = item?.name;
          const designation = item?.designation;
          return (
            <div className="text-wrap item bg-white px-4 py-2 br-8" key={index}>
              <i className="ri-double-quotes-l fs-28"></i>
              <p className="text-color-light-gray ">{description}</p>
              <div className="d-flex gap-2 align-items-center">
                <img
                  src={Image.defaultUserImg}
                  className="w-35px h-35px"
                  alt=""
                />
                <span className="d-block">
                  <h6 className="fs-14 m-0 p-0 mb-1">{name}</h6>
                  <p className="fs-12 text-color-light-gray p-0 m-0">
                    {designation}
                  </p>
                </span>
              </div>
            </div>
          );
        })}
        {reviewData?.map((item, index) => {
          const description = item?.description;
          const name = item?.name;
          const designation = item?.designation;
          return (
            <div className="text-wrap item bg-white px-4 py-2 br-8" key={index}>
              <i className="ri-double-quotes-l fs-28"></i>
              <p className="text-color-light-gray ">{description + index}</p>
              <div className="d-flex gap-2 align-items-center">
                <img
                  src={Image.defaultUserImg}
                  className="w-35px h-35px"
                  alt=""
                />
                <span className="d-block">
                  <h6 className="fs-14 m-0 p-0 mb-1">{name}</h6>
                  <p className="fs-12 text-color-light-gray p-0 m-0">
                    {designation}
                  </p>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="fade"></div>
    </div>
  );
};

export default Reviews;
