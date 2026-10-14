CREATE CONSTRAINT user_profile_userId_unique
IF NOT EXISTS
FOR (p:user_profile)
REQUIRE p.userId IS UNIQUE;