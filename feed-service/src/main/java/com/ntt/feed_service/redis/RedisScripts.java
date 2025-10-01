package com.ntt.feed_service.redis;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class RedisScripts {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private RedisScript<List> filterFeedScript;

    @PostConstruct
    public void loadScripts() throws IOException {
        InputStream is = getClass().getClassLoader().getResourceAsStream("redis-scripts/filter_feed.lua");
        log.info("Loading filter script from {}", is);
        if (is == null) {
            throw new IOException("Could not find Redis Lua script: redis-scripts/filter_feed.lua in classpath.");
        }
        String script = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        filterFeedScript = RedisScript.of(script,List.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> filterFeed(String feedKey, String keyReadPost,int offset, int size, List<String> blacklist) {
        List<String> args = new ArrayList<>();
        args.add(String.valueOf(offset));
        args.add(String.valueOf(size));
        args.addAll(blacklist);
        List<String> keys = List.of(feedKey, keyReadPost);
        //Lua return table
        return  (List<String>) redisTemplate.execute(filterFeedScript,
                keys,(Object[]) args.toArray(new String[0]));
    }
}
