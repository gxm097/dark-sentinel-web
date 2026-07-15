export default {
  fetch(request) {
    return Response.json({
      success: true,
      method: request.method,
      message: "API route is working."
    });
  }
};
