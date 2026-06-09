class controller {
  static get = async () => {
    try {
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "archivedData >> get",
      });
    }
  };
}
export default controller;
