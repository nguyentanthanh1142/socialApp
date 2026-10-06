import httpClient from "../../../api/httpClient";
import { API } from "../../../configurations/configuration";

export const completeOnboarding = (payload, signal) =>
    httpClient.put(API.COMPLETE_ONBOARDING, payload, { signal });


export const saveProfileOnboarding = (payload, signal) => {
    const body = {
        preferredTheme: "light",
        ...payload,
    };
    return httpClient.put(API.COMPLETE_ONBOARDING, body, { signal });
};