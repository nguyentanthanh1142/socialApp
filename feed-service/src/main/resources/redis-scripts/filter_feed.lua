-- KEYS[1] = feedKey (ZSET)
-- KEYS[2] = readMark
-- ARGV[1] = offset
-- ARGV[2] = size
-- ARGV[3][3..n] = blacklist
local BATCH_SIZE = 50
local offset = tonumber(ARGV[1])
local size = tonumber(ARGV[2])
local blacklist = {}
for i = 3, #ARGV do
    blacklist[ARGV[i]] = true
end

local chunk = redis.call('ZRANGE', KEYS[1], 0, -1)

local result = {}
local skipped = 0
local count = 0

for i = 1, #chunk do
    local v = chunk[i]
    if not blacklist[v] and redis.call('SISMEMBER',KEYS[2],v) == 0 then
        if skipped < offset then
            skipped = skipped + 1
        else
            table.insert(result,v)
            count = count + 1
            if count >= size then
                break
            end
        end
    end
end

return result


