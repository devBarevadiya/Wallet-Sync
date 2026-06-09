import { Button, Form, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import * as yup from "yup";
import { useFormik } from "formik";
import { useState } from "react";
import { useModalScroll } from "../../../helpers/customHooks";

const OnlyIconsModal = ({ isOpen, onHide, callback }) => {
  const [primaryIconIndex, setPrimaryIconIndex] = useState(0);
  const totalElements = 81;
  const lengthArray = Array.from(
    { length: totalElements },
    (_, index) => `/images/icons/lightGrayColor/icon${index + 1}.png`
  );
  // const lengthArray = Array.from(
  //   { length: totalElements },
  //   (_, index) =>
  //     `/images/icons/primaryColor/accountTypeIcons/accountTypeIcon${
  //       index + 1
  //     }.png`
  // );

  async function base64ToFile(base64String, mimeType, fileName) {
    const response = await fetch(base64String);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: mimeType });
    return file;
  }

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const initialValues = {
    color: "#faf2ff",
    icon: `/images/icons/primaryColor/accountTypeIcons/accountTypeIcon${
      primaryIconIndex + 1
    }.png`,
  };

  const validationSchema = yup.object({
    color: yup.string().required("color is required"),
    icon: yup.string().required("icon is required"),
  });

  const validation = useFormik({
    name: "onlyIconModal",
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const canvas = document.createElement("canvas");
      canvas.width = 200; // Fixed width for canvas
      canvas.height = 200; // Fixed height for canvas
      const ctx = canvas.getContext("2d");
    
      // Set the background color of the canvas
      ctx.fillStyle = values.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    
      // Draw the selected icon on the canvas with reduced size
      const img = new Image();
      img.src = validation.values.icon;
    
      img.onload = async () => {
        // Create a square container with object-fit: contain
        const paddingPercent = 10; // Padding percentage
        const padding = (paddingPercent / 100) * canvas.width;
    
        // Calculate the dimensions of the icon, reducing the size by 50%
        const aspectRatio = img.width / img.height;
        const iconHeight = (canvas.height - 2 * padding) * 0.6; // Icon height reduced by 50%
        const iconWidth = iconHeight * aspectRatio; // Maintain aspect ratio
    
        // Draw the icon in the center of the canvas
        const iconX = (canvas.width - iconWidth) / 2; // X position to center the icon
        const iconY = (canvas.height - iconHeight) / 2; // Y position to center the icon
    
        // Draw the icon with the reduced size
        ctx.drawImage(img, iconX, iconY, iconWidth, iconHeight);
    
        // Convert the canvas to a base64 image
        const imgData = canvas.toDataURL("image/png");
        const file = await base64ToFile(imgData, "image/png", "icon.png");
    
        // If a callback is provided, execute it
        if (callback) {
          callback({ file, base64: imgData, color: values.color });
        }
    
        // Reset form after submission
        resetForm();
        setPrimaryIconIndex(0);
      };
    }    
  });

  return (
    <Modal
      show={isOpen}
      centered={true}
      onHide={() => {
        onHide();
        setPrimaryIconIndex(0);
      }}
      className="icon-modal modal-650px category-modal"
      backdropClassName="bg-transparent"
      animation={false}
    >
      <Modal.Header className="mb-2 border-bottom common-border-color pb-3">
        <div className="d-flex align-items-center justify-content-between w-100">
          <Modal.Title className="text-capitalize fs-21 responsive">
            <i
              className="ri-arrow-left-line cursor-pointer fs-4 me-3"
              onClick={() => {
                setPrimaryIconIndex(0);
                onHide();
              }}
            ></i>
            Add/Edit icon
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body ref={modalBodyRef} className="h-80vh">
        <Form onSubmit={validation.handleSubmit}>
          <Button
            type="submit"
            className="fs-15 d-flex align-items-center gap-2 primary-btn"
          >
            <i className="fs-4 ri-arrow-up-circle-fill"></i> Upload Icon
          </Button>
          {validation.touched.icon && validation.errors.icon && (
            <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
              {validation.errors.icon}
            </span>
          )}
          {validation.touched.color && validation.errors.color && (
            <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
              {validation.errors.color}
            </span>
          )}
          <span className="d-block mt-4"></span>

          <div className="mt-4">
            <span className="text-capitalize mb-3 d-block">Select Icons</span>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              {lengthArray.map((item, index) => {
                return (
                  <span
                    key={index}
                    onClick={() => {
                      setPrimaryIconIndex(index);
                      validation.setFieldValue(
                        "icon",
                        `/images/icons/primaryColor/accountTypeIcons/accountTypeIcon${
                          index + 1
                        }.png`
                      );
                    }}
                    style={{
                      padding: "9px",
                      backgroundColor: `${
                        primaryIconIndex === index ? "#faf2ff" : "#fafafa"
                      }`,
                    }}
                    className="d-block h-40px w-40px d-flex align-items-center justify-content-center br-8"
                  >
                    <img
                      src={
                        primaryIconIndex === index
                          ? `/images/icons/primaryColor/accountTypeIcons/accountTypeIcon${
                              primaryIconIndex + 1
                            }.png`
                          : item
                      }
                      className={`icon-image h-100 aspect-square object-fit-contain`}
                      alt="icon"
                    />
                  </span>
                );
              })}
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

OnlyIconsModal.propTypes = {
  isOpen: PropTypes.bool,
  onHide: PropTypes.func,
  callback: PropTypes.func,
  onlyIcons: PropTypes.bool,
};

export default OnlyIconsModal;
