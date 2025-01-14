import axios from "axios";

import { endpoints } from "juju/jimm/api";

export const axiosInstance = axios.create({
  baseURL: endpoints().rebac,
  withCredentials: true,
});
