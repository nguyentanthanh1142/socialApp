import httpClient from "../../../api/httpClient";
import { API } from "../../../configurations/configuration";

/**
 * Completes the first-time onboarding flow by sending profile setup data
 * to the backend. On success, the backend marks the user's isFirstLogin = false.
 */
export const completeOnboarding = (payload, signal) =>
    httpClient.put(API.COMPLETE_ONBOARDING, payload, {
        headers: { "Content-Type": "application/json" },
        ...(signal ? { signal } : {}),
    });

/**
 * Incremental save of profile data during onboarding (Step 1 -> Step 2 transition).
 */
export const saveProfileOnboarding = (payload, signal) => {
    // Bổ sung preferredTheme mặc định nếu backend yêu cầu field này
    const body = {
        preferredTheme: "light",
        ...payload,
    };

    // LƯU Ý: Nếu backend có endpoint riêng cho profile (ví dụ API.UPDATE_PROFILE),
    // hãy thay API.COMPLETE_ONBOARDING thành API.UPDATE_PROFILE tại đây.
    return httpClient.put(API.COMPLETE_ONBOARDING, body, {
        headers: { "Content-Type": "application/json" },
        ...(signal ? { signal } : {}),
    });
};