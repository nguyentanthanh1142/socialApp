package com.ntt.socket_service.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserPresenceService {

    StringRedisTemplate stringRedisTemplate;

    private static final String USER_SESSIONS_PREFIX = "user:sessions:";
    private static final String USER_STATUS_KEY = "user:presence:status";
    private static final String USER_LAST_SEEN_KEY = "user:presence:last_seen";

    public boolean handleUserConnect(String userId, String socketId)
    {
        String sessionKey = USER_SESSIONS_PREFIX + userId;
        Long addedCount = stringRedisTemplate.opsForSet().add(sessionKey,socketId);

        boolean isFirstSession = (addedCount !=null && addedCount >0 && stringRedisTemplate.opsForSet().size(sessionKey) == 1);

        if(isFirstSession){
            stringRedisTemplate.opsForHash().put(USER_STATUS_KEY, userId, "ONLINE");
            stringRedisTemplate.opsForHash().delete(USER_LAST_SEEN_KEY, userId);
        }
        return isFirstSession;
    }

    public boolean handleUserDisconnect(String userId, String socketId)
    {
        String sessionKey = USER_SESSIONS_PREFIX + userId;
        stringRedisTemplate.opsForSet().remove(sessionKey, socketId);

        Long remainingSessions = stringRedisTemplate.opsForSet().size(sessionKey);
        boolean isOfflineCompletely = (remainingSessions != null && remainingSessions == 0);

        if(isOfflineCompletely){
            String lastSeenTime = Instant.now().toString();

            stringRedisTemplate.opsForHash().put(USER_STATUS_KEY,userId, "OFFLINE");
            stringRedisTemplate.opsForHash().put(USER_LAST_SEEN_KEY,userId, lastSeenTime);
        }

        return isOfflineCompletely;
    }

    public Map<String,Object> getUserPresence(String userId){
        String status = (String) stringRedisTemplate.opsForHash().get(USER_STATUS_KEY, userId);
        String lastSeen = (String) stringRedisTemplate.opsForHash().get(USER_LAST_SEEN_KEY, userId);
        return Map.of(
                "userId" ,userId,
                "status", status != null ? status : "OFFLINE",
                "lastSeen", lastSeen != null ? lastSeen : ""
        );
    }
    public Map<String, Map<String, Object>> getPresencesByUserIds(List<String> userIds) {
        Map<String, Map<String, Object>> result = new HashMap<>();
        if (userIds == null || userIds.isEmpty()) {
            return result;
        }

        List<Object> statuses = stringRedisTemplate.opsForHash().multiGet(USER_STATUS_KEY, new ArrayList<>(userIds));
        List<Object> lastSeens = stringRedisTemplate.opsForHash().multiGet(USER_LAST_SEEN_KEY, new ArrayList<>(userIds));

        for (int i = 0; i < userIds.size(); i++) {
            String userId = userIds.get(i);
            String status = (String) statuses.get(i);
            String lastSeen = (String) lastSeens.get(i);

            result.put(userId, Map.of(
                    "status", status != null ? status : "OFFLINE",
                    "lastSeen", lastSeen != null ? lastSeen : ""
            ));
        }

        return result;
    }
}
