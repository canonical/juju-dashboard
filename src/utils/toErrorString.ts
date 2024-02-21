export enum Label {
  UNKNOWN_ERROR = "Unknown error",
}

const toErrorString = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return Label.UNKNOWN_ERROR;
};

export default toErrorString;
