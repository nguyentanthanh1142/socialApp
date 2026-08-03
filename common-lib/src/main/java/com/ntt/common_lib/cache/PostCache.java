package com.ntt.common_lib.cache;

import com.ntt.common_lib.dto.UserProfileDTO;

public interface PostCache {
    UserProfileDTO getUserProfile(String userId);
    void putPost(UserProfileDTO userProfile);
}
