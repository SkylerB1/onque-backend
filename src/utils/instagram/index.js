const { default: axios } = require("axios");

const { GRAPH_API_VERSION, FACEBOOK_URL } = process.env;

const DEFAULT_GRAPH_API_ORIGIN = "https://graph.facebook.com";
const DEFAULT_GRAPH_API_VERSION = "v18.0";

const GRAPH_API_BASE_URL =
  (FACEBOOK_URL ?? DEFAULT_GRAPH_API_ORIGIN) +
  "/" +
  (GRAPH_API_VERSION ? GRAPH_API_VERSION : DEFAULT_GRAPH_API_VERSION);

/**
 * Setting retries with 3 seconds delay, as async video upload may take a while in the backed to return success
 * @param {*} n
 * @returns
 */
function _wait(n) {
  return new Promise((resolve) => setTimeout(resolve, n));
}

/**
 * Retrieves container status for the uploaded video, while its uploading in the backend asynchronously
 * and checks if the upload is complete.
 * @param {*} retryCount
 * @param {*} checkStatusUri
 * @returns Promise<boolean>
 */
const isUploadSuccessful = async (retryCount, checkStatusUri) => {
  try {
    if (retryCount > 30) return false;
    const response = await axios.get(checkStatusUri);
    if (response.data.status_code != "FINISHED") {
      await _wait(3000);
      await isUploadSuccessful(retryCount + 1, checkStatusUri);
    }
    return true;
  } catch (e) {
    throw e;
  }
};

const isReelUploadSuccessful = async (retryCount, checkStatusUri) => {
  try {
    if (retryCount > 30)
      return { success: false, data: "Failed to upload reel: Timeout" };

    const response = await axios.get(checkStatusUri);

    const { status, id } = response.data;
    if (status?.video_status == "ready") {
      return { success: true, data: id };
    } else if (status.uploading_phase.status === "error") {
      return { success: false, data: status.uploading_phase.error };
    } else if (status.processing_phase.status === "error") {
      return { success: false, data: status.processing_phase.error };
    } else if (status.publishing_phase.status === "error") {
      return { success: false, data: status.publishing_phase.error };
    } else if (status.copyright_check_status.status === "error") {
      return { success: false, data: status.copyright_check_status };
    } else {
      await _wait(5000);
      return await isReelUploadSuccessful(retryCount + 1, checkStatusUri);
    }
  } catch (e) {
    throw e;
  }
};

const buildAPIURL = (path, searchParams, accessToken) => {
  const url = new URL(path, GRAPH_API_BASE_URL);

  url.search = new URLSearchParams(searchParams);
  if (accessToken) url.searchParams.append("access_token", accessToken);

  return url.toString();
};
module.exports = {
  isUploadSuccessful,
  buildAPIURL,
  isReelUploadSuccessful,
};
