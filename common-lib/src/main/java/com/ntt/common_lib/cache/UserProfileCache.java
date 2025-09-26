package com.ntt.common_lib.cache;

import com.ntt.common_lib.dto.UserProfileDTO;

public interface UserProfileCache {
    UserProfileDTO getUserProfile(String userId);
    void putUserProfile(UserProfileDTO userProfile);
}
