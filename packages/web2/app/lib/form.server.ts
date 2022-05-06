import {
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";

// patch for https://github.com/remix-run/remix/issues/2248
export const createFileUploadHandler = unstable_createFileUploadHandler;
export const parseMultipartFormData = unstable_parseMultipartFormData;
