import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginMediaPreview from "filepond-plugin-media-preview";
import FilePondPluginImageValidateSize from "filepond-plugin-image-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond-plugin-media-preview/dist/filepond-plugin-media-preview.min.css";
import "filepond/dist/filepond.min.css";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginMediaPreview,
  FilePondPluginImageValidateSize,
  FilePondPluginFileValidateType
);

// Function to fetch image and convert to File object
const urlToFile = async (url, mimeType) => {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const blob = new Blob([buffer], { type: mimeType });
  const filename = url?.substring(url?.lastIndexOf("/") + 1);
  return new File([blob], filename, { type: mimeType });
};

const MyFilePondComponent = ({
  html,
  previewUrl,
  name = "file",
  maxFileSize = 2,
  className,
  validation,
  onlyVideo = false,
  onlyImage = false,
  ...props
}) => {
  const [fileData, setFileData] = useState({ file: [], encoded: "" });
  const [labelHtml, setLabelHtml] = useState(document.querySelector("label"));
  const acceptedImageTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
  ];

  const acceptedFileTypesFunc = () => {
    if (onlyImage) return acceptedImageTypes;
    else if (onlyVideo) return ["video/*"];
    else return ["video/*", ...acceptedImageTypes];
  };

  const acceptedFileTypes = acceptedFileTypesFunc();
  useEffect(() => {
    const filePondContainer = document.querySelector("label");
    setLabelHtml(filePondContainer);
  }, []);

  useEffect(() => {
    if (labelHtml) {
      setTimeout(() => {
        labelHtml.innerHTML = html;
      }, 0);
    }
    if (labelHtml?.innerHTML.includes("Browse")) {
      setTimeout(() => {
        labelHtml.innerHTML = html;
      }, 0);
    }
  }, [html, labelHtml]);

  const getMimeType = () => {
    const extension = previewUrl
      ?.substring(previewUrl?.lastIndexOf(".") + 1)
      .toLowerCase();
    switch (extension) {
      case "webp":
        return "image/webp";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "mp4":
        return "video/mp4";
      case "mp3":
        return "video/mp3";
      case "mov":
        return "video/quicktime";
      default:
        return "image/jpeg";
    }
  };
  const mimeType = getMimeType();

  useEffect(() => {
    if (previewUrl) {
      urlToFile(previewUrl, mimeType).then((file) => {
        setFileData({ file: [file], encoded: "" });
      });
    }
  }, [previewUrl, mimeType]);

  const handleFilePreview = async (input) => {
    const file = input[0]?.file;
    const fileSizeInBytes = file?.size;
    const fileSizeInKB = fileSizeInBytes / 1024;
    const fileSizeInMB = fileSizeInKB / 1024;
    const filename = previewUrl?.substring(previewUrl?.lastIndexOf("/") + 1);
    validation.setFieldTouched(name, true);
    if (!file) {
      validation.setFieldValue(name, "");
      validation.setFieldError(name, "Image is required");
      return;
    }
    if (fileSizeInMB > maxFileSize) {
      validation.setFieldError(
        name,
        `File should be max to ${Number(maxFileSize)}mb`
      );
      return;
    }
    if (file?.name && filename !== file?.name) {
      validation.setFieldValue(name, file);
    }
    if (file && file instanceof File) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const baseUrl = e.target.result
          .replace("data:", "")
          .replace(/^.+,/, "")
          .trim();
        setFileData({
          file: input,
          encoded: baseUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <FilePond
        {...props}
        files={fileData.file}
        acceptedFileTypes={acceptedFileTypes}
        // onaddfile={(error, file) => {
        //   if (error) {
        //     console.log("[ERROR] :" + error);
        //   } else {
        //     // validation.setFieldValue(name, file.file);
        //   }
        // }}
        onupdatefiles={handleFilePreview}
        onremovefile={() => {
          setFileData({
            file: [],
            encoded: "",
          });
        }}
        allowMultiple={false}
        maxFiles={1}
        name={name}
        className={`filepond filepond-input-multiple ${className}`}
      />
    </>
  );
};

MyFilePondComponent.propTypes = {
  maxFileSize: PropTypes.number,
  previewUrl: PropTypes.any,
  html: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  validation: PropTypes.any,
  onlyVideo: PropTypes.any,
  onlyImage: PropTypes.any,
};

export default MyFilePondComponent;
