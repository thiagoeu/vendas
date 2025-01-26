import e from "express";

export const ok = (body) => {
  return {
    success: true,
    statusCode: 200,
    body,
  };
};
export const notfound = () => {
  return {
    success: true,
    statusCode: 400,
    body: "Not found",
  };
};
export const serverError = (error) => {
  return {
    success: true,
    statusCode: 200,
    body: error,
  };
};
