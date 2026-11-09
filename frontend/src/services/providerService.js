import api from "./api";

export const createProviderProfile = (profile) =>
    api.post("/providers/profile", profile);
