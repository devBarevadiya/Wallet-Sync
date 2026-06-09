import { Button, Table } from "react-bootstrap";
import PageTitle from "../../../components/admin/pageTitle/PageTitle";
import { useCallback, useEffect, useState } from "react";
import {
  deleteBlogThunk,
  getBlogByPaginationThunk,
  getBlogThunk,
} from "../../../store/actions";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import { CREATE, UPDATE } from "../../../routes/AdminRoutes";
import { clearBlogSingleData } from "../../../store/blog/slice";
import useConfirmationAlert from "../../../components/admin/sweetAlerts/ConfirmationAlert";
import DynamicLordIcon from "../../../components/DynamicLordIcon";
import { Helmet } from "react-helmet";
import CommonDeleteModal from "../../../components/admin/modals/deleteModals/CommonDeleteModal";

const Blog = () => {
  const [isDelete, setIsDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, dataLoading, paginationData, paginationLoading } =
    useSelector((store) => store.Blog);

  const totalPages = paginationData?.totalPages;
  const page = paginationData?.page;

  const triggerDeleteBlog = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Blog Delete",
    text: "Are you sure you want to delete this blog? This change cannot be undone.",
    confirmButtonText: "Delete Blog",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Blog has been successfully deleted.",
  });

  const handleDeleteBlog = (id) => {
    // triggerDeleteBlog({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(deleteBlogThunk(id));
    //     if (deleteBlogThunk.fulfilled.match(response)) {
    //       dispatch(getBlogThunk());
    //       return true;
    //     }
    //     if (deleteBlogThunk.rejected.match(response)) {
    //       dispatch(getBlogThunk());
    //       return false;
    //     }
    //   },
    // });
    setDeleteId(id);
    setIsDelete(true);
  };

  const handleCloseDeleteModal = useCallback(() => {
    setIsDelete(false), setDeleteId(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(deleteBlogThunk(deleteId));
    if (deleteBlogThunk.fulfilled.match(response)) {
      dispatch(getBlogThunk());
      return true;
    }
    if (deleteBlogThunk.rejected.match(response)) {
      dispatch(getBlogThunk());
      return false;
    }
    return false;
  }, [dispatch, deleteId]);

  const handleLoadMore = useCallback(() => {
    dispatch(getBlogByPaginationThunk({ page: page + 1 }));
  }, [page]);

  useEffect(() => {
    // if (!data.length) {
    dispatch(getBlogThunk());
    // }
    dispatch(clearBlogSingleData());
  }, [dispatch]);

  return (
    <div className={`responsive blog-page py-3`}>
      <div className={`mb-3`}>
        <PageTitle
          title="Blog"
          subTitle="Optimizing your import operations"
          buttonContent="Add Blog"
          onButtonClick={() => navigate(ADMIN.BLOG.PATH + CREATE)}
        />
      </div>
      <div className="bg-white card common-border-color overflow-hidden br-18">
        <div
          className={`border-bottom common-border-color p-3 py-4 d-flex align-items-center justify-content-between`}
        >
          <div>
            <span className={`lh-base fw-medium fs-18`}>Blog List</span>
          </div>
          {/* <div>
            <Link
              to={ADMIN.BLOG.PATH + CREATE}
              className={`d-flex align-items-center justify-content-center border-0 v-fit br-10 p-0 min-wh-40px primary-btn`}
            >
              <i className="fw-bold fs-5 ri-add-line"></i>
            </Link>
          </div> */}
        </div>

        {!data?.length ? (
          <DynamicLordIcon
            icon="wzwygmng"
            subTitle="You will have to add Blog to show here"
            title="Oops ! No Blog Yet !"
          />
        ) : (
          <div>
            <Table responsive className="blog-table align-middle border-0 mb-0">
              <tbody>
                {data.map((ele, index) => {
                  const id = ele._id;
                  const image = ele?.image;
                  const title = ele?.title;
                  const description = ele?.description;
                  const slug = ele?.slug;
                  return (
                    <tr key={id}>
                      <td
                        onClick={() =>
                          navigate(ADMIN.BLOG.PATH + UPDATE + `/${slug}`)
                        }
                        className={`min-w-90px w-90px cursor-pointer text-truncate border-0 p-3 pe-0 ${
                          (index + 1) % 2 !== 0 ? "client-section-bg-color" : ""
                        } ${index == data?.length - 1 ? "" : "border-bottom common-border-color"}`}
                      >
                        <div
                          className={`border common-border-color aspect-square br-10 overflow-hidden`}
                        >
                          <img
                            src={image}
                            alt={`blog-${index}`}
                            className={`min-w-90px w-90px aspect-square object-fit-cover`}
                          />
                        </div>
                      </td>
                      <td
                        onClick={() =>
                          navigate(ADMIN.BLOG.PATH + UPDATE + `/${slug}`)
                        }
                        className={`cursor-pointer border-0 p-3 ${
                          (index + 1) % 2 !== 0 ? "client-section-bg-color" : ""
                        } ${index == data?.length - 1 ? "" : "border-bottom common-border-color"}`}
                      >
                        <span
                          className={`text-truncate fs-18 fw-normal lh-base mb-0 max-w-800px text-truncate d-block pe-5`}
                        >
                          {title}
                        </span>
                        <p
                          className={`text-truncate fs-14 lh-base fw-normal text-color-monsoon mb-0 max-w-700px d-block text-truncate`}
                        >
                          {description}
                        </p>
                      </td>
                      <td
                        className={`w-fit text-truncate border-0 text-end ps-3 pe-4 ${
                          (index + 1) % 2 !== 0 ? "client-section-bg-color" : ""
                        } ${index == data?.length - 1 ? "" : "border-bottom common-border-color"}`}
                      >
                        <div
                          className={`d-flex align-items-center justify-content-end gap-2`}
                        >
                          <Button
                            onClick={() => handleDeleteBlog(id)}
                            className={`bg-transparent p-0 m-0 border-0`}
                          >
                            <i className="fs-5 fw-normal text-color-invalid ri-delete-bin-6-fill"></i>
                          </Button>
                          <Button
                            onClick={() =>
                              navigate(ADMIN.BLOG.PATH + UPDATE + `/${slug}`)
                            }
                            className={`bg-transparent p-0 m-0 border-0`}
                          >
                            <i className="fs-5 fw-normal text-color-primary ri-edit-2-fill"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {totalPages > page && (
              <Button
                onClick={handleLoadMore}
                disabled={paginationLoading}
                className="primary-btn mx-auto br-8 v-fit py-2 mb-3 d-block"
              >
                {paginationLoading ? "Loading..." : "Load more"}
              </Button>
            )}
          </div>
        )}
      </div>

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete Blog",
          description: "Are you sure you want to delete the blog?",
        }}
        onConfirm={handleConfirm}
        loading={loading || dataLoading}
      />
    </div>
  );
};

export default Blog;
