import { Button, Col, Form, Row } from "react-bootstrap";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import MyFilePondComponent from "../../../components/MyFilePondComponent";
import { useFormik } from "formik";
import * as yup from "yup";
import InputField from "../../../components/inputFields/InputField";
import TextAreaField from "../../../components/inputFields/TextAreaField";
import ReactQuill from "react-quill";

import {
  awsThunk,
  checkTitleAvailableThunk,
  createBlogThunk,
  getBlogDetailsThunk,
  updateBlogThunk,
} from "../../../store/actions";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import { useEffect, useRef } from "react";
import { clearBlogSingleData } from "../../../store/blog/slice";

const Editor = () => {
  const quillRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { singleData, loading } = useSelector((store) => store.Blog);
  const { uploadLoading } = useSelector((store) => store.Aws);
  const { slug } = useParams();

  const validationSchema = yup.object({
    html: yup
      .string()
      .required("Editor must not be empty")
      // .test("is-valid-blog", "Image is required in the content", (value) => {
      //   const hasImage = /<img[^>]+src="[^"]+"[^>]*>/g.test(value);
      //   return hasImage;
      // })
      .test("image-size", "Image length should be max 2MB", (value) => {
        const contentLength = new Blob([value]).size;
        return contentLength <= 2 * 1024 * 1024;
      }),
    image: yup
      .mixed()
      .required("Image is required")
      .test("image-size", "Image length should be max 2MB", (value) => {
        const contentLength = new Blob([value]).size;
        return contentLength <= 2 * 1024 * 1024;
      }),
    title: yup.string().required("Title is required"),
    description: yup.string().required("Description is required"),
  });
  const validation = useFormik({
    initialValues: {
      html: singleData?.html || "",
      image: singleData?.image || "",
      title: singleData?.title || "",
      description: singleData?.description || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (!slug || values.title !== singleData.title) {
          const result = await dispatch(checkTitleAvailableThunk(values.title));
          if (checkTitleAvailableThunk.fulfilled.match(result)) {
            const isTitleTaken = result.payload.data.isTaken;
            if (isTitleTaken) {
              validation.setFieldError("title", "Title is already used");
              setSubmitting(false);
              return;
            }
          }
        }
        const formData = new FormData();
        const dirName = "blogs";
        formData.append("file", values.image);
        formData.append("dirName", dirName);
        if (slug) {
          if (!singleData?.image?.endsWith(values?.image?.name)) {
            const response = await dispatch(awsThunk(formData));
            const imagePath =
              import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
              response.payload.data;
            values.image = imagePath;
          } else {
            delete values.image;
          }
          const data = values;
          const res = await dispatch(updateBlogThunk({ slug, data }));
          // if (updateBlogThunk.fulfilled.match(res)) {
          navigate(ADMIN.BLOG.PATH);
          // }
        } else {
          const formData = new FormData();
          const dirName = "blogs";
          formData.append("file", values.image);
          formData.append("dirName", dirName);
          const response = await dispatch(awsThunk(formData));
          if (awsThunk.fulfilled.match(response)) {
            const imagePath =
              import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
              response.payload.data;
            values.image = imagePath;
            const res = await dispatch(createBlogThunk(values));
            // if (createBlogThunk.fulfilled.match(res)) {
            navigate(ADMIN.BLOG.PATH);
            // }
          }
        }
      } catch (error) {
        console.log("[ERROR] :" + error);
      }
    },
  });

  const toolbarOptions = [
    [{ color: [] }, { background: [] }],
    ["bold", "italic", "underline", "strike"],
    ["image", "link"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [
      { align: "" },
      { align: "center" },
      { align: "right" },
      { align: "justify" },
    ],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }]
  ];

  const module = {
    toolbar: toolbarOptions,
  };

  const isContentEmpty = (content) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const hasImageUrl = Array.from(tempDiv.querySelectorAll("img")).some(
      (img) => img.src
    );
    return !textContent.trim() && !hasImageUrl;
  };

  // useEffect(() => {
  //   const { title } = searchQuery;
  //   const delayDebounceFn = setTimeout(async () => {
  //     if (title !== "") {
  //       const response = await dispatch(
  //         checkTitleAvailableThunk(validation.values.title)
  //       );
  //       if (checkTitleAvailableThunk.fulfilled.match(response)) {
  //         if (response?.payload?.data?.isTaken) {
  //           // validation.setFieldValue("title", "yash guard");
  //           validation.setFieldTouched("title", true);
  //           validation.setFieldError("title", "Title is already used");
  //         }
  //       }
  //     }
  //   }, 500);

  //   return () => clearTimeout(delayDebounceFn);
  // }, [searchQuery, dispatch]);

  useEffect(() => {
    if (slug) {
      dispatch(getBlogDetailsThunk(slug));
    } else {
      dispatch(clearBlogSingleData());
    }
  }, [dispatch]);

  return (
    <div className={`blog-editor-page py-3`}>
      <div className={`mb-3`}>
        <PageTitle
          title="Blog"
          isButton={false}
          subTitle="Optimizing your import operations"
        />
      </div>
      <div className="bg-white card overflow-hidden br-18 border common-border-color">
        <div className={`border-bottom common-border-color px-3 py-2`}>
          <span className={`lh-base fw-medium fs-18`}>Create Blog</span>
        </div>
        <Form onSubmit={validation.handleSubmit} className={`py-4 px-20px`}>
          <Row>
            <Col
              md={5}
              className="mb-3 mb-md-0 position-relative d-flex flex-column"
            >
              <div
                className={`br-10 overflow-hidden h-100 ${
                  validation.touched.image && validation.errors.image
                    ? "border border-color-invalid"
                    : `border-2 border-dashed common-border-color`
                }`}
              >
                <MyFilePondComponent
                  html={`
                    <div class="text-center">
                      <i class="d-block responsive fs-38 fw-medium text-dark ri-upload-cloud-2-line lh-sm"></i>
                      <span class="responsive fs-16 fw-medium lh-sm">Drag & Drop your files here or <span class="text-color-primary text-decoration-underline">choose files</span></span>
                      <br />
                      <span class="responsive fs-16 fw-medium lh-sm">500 MB max file size.</span>
                    </div>  
                  `}
                  className="mb-0"
                  onlyImage={true}
                  validation={validation}
                  name="image"
                  previewUrl={slug && singleData?.image}
                />
              </div>
              {validation.touched.image &&
              validation.touched.description &&
              validation.errors.image &&
              validation.errors.description ? (
                <p className="d-none d-md-block mb-0 mt-1 text-color-invalid fs-12 text-capitalize d-block">
                  {validation.errors.image}
                </p>
              ) : null}
              {validation.touched.image && validation.errors.image ? (
                <p className="d-block d-md-none mb-0 mt-1 text-color-invalid fs-12 text-capitalize d-block">
                  {validation.errors.image}
                </p>
              ) : null}
            </Col>
            <Col className="d-flex flex-column">
              <InputField
                className={`mb-3`}
                label="title"
                placeholder="Enter your title"
                name="title"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.title}
                invalid={validation.touched.title && validation.errors.title}
                errorMessage={validation.errors.title}
              />
              <TextAreaField
                label="description"
                placeholder="Enter your description..."
                name="description"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.description}
                invalid={
                  validation.touched.description &&
                  validation.errors.description
                }
                errorMessage={validation.errors.description}
              />
            </Col>
            {!validation.touched.description && validation.errors.image ? (
              <Col xs={12} className={`d-none d-md-block`}>
                {validation.touched.image && validation.errors.image ? (
                  <p className="mb-0 mt-1 text-color-invalid fs-12 text-capitalize d-block">
                    {validation.errors.image}
                  </p>
                ) : null}
              </Col>
            ) : null}
          </Row>
          <div className={`mt-4 position-relative`}>
            <ReactQuill
              ref={quillRef}
              className={`${
                validation.touched.html && validation.errors.html
                  ? "in-valid"
                  : ""
              } position-relative`}
              modules={module}
              theme="snow"
              name="html"
              placeholder="Enter your blog writing here..."
              value={validation.values.html}
              onChange={(value) => {
                if (isContentEmpty(value)) {
                  validation.setFieldValue("html", "");
                  validation.setFieldError("html", "Editor must not be empty");
                } else {
                  validation.setFieldValue("html", value);
                }
              }}
              onBlur={() => {
                // validation.handleBlur("html")(true);
                validation.setFieldTouched("html", true);
              }}
            />
            {validation.touched.html && validation.errors.html ? (
              <p className="mt-1 text-color-invalid fs-12 text-capitalize mt-1 d-block">
                {validation.errors.html}
              </p>
            ) : null}
          </div>
          <div className={`mt-4 mt-lg-5 quill-main-container`}>
            <Button
              disabled={uploadLoading || loading}
              type="submit"
              className={`border-0 primary-btn v-fit py-2 br-10 w-fit px-4 bg-color-primary mx-auto d-block text-capitalize fs-16 fw-medium lh-base text-white`}
            >
              {uploadLoading || loading ? "loading..." : "submit"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Editor;
