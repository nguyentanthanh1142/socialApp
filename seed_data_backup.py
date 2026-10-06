#!/usr/bin/env python3
"""
Seed Data Script for Social App
Creates 50 users with profiles, social graph relationships, and posts.
"""

import random
import time
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from faker import Faker
import requests

# Initialize Faker with Vietnamese locale
fake = Faker('vi_VN')

# Configuration
API_GATEWAY_URL = "http://localhost:8888"
API_PREFIX = "/api/v1"

# Service endpoints (via API Gateway)
IDENTITY_URL = f"{API_GATEWAY_URL}{API_PREFIX}/identity"
PROFILE_URL = f"{API_GATEWAY_URL}{API_PREFIX}/profile/users"
RELATION_URL = f"{API_GATEWAY_URL}{API_PREFIX}/relation"
POST_URL = f"{API_GATEWAY_URL}{API_PREFIX}/post"

# Vietnamese cities and provinces
VIETNAMESE_CITIES = [
    "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
    "Huế", "Nha Trang", "Buôn Ma Thuột", "Đà Lạt", "Vũng Tàu",
    "Quảng Ninh", "Bình Dương", "Đồng Nai", "Thừa Thiên Huế", "Khánh Hòa"
]

# Vietnamese first names and last names for more realistic data
VIETNAMESE_FIRST_NAMES = [
    "An", "Bình", "Chi", "Dung", "Giang", "Hương", "Khánh", "Lan",
    "Minh", "Nam", "Phong", "Quang", "Thảo", "Tiến", "Vy", "Yến",
    "Hùng", "Linh", "Mai", "Ngọc", "Phúc", "Sơn", "Thịnh", "Trang",
    "Tuấn", "Vy", "Xuân", "Y", "Anh", "Bảo", "Cường", "Duy"
]

VIETNAMESE_LAST_NAMES = [
    "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ",
    "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"
]

# Vietnamese sample posts
VIETNAMESE_POSTS = [
    "Hôm nay trời đẹp quá! ☀️",
    "Cuối tuần đi đâu chơi nhỉ?",
    "Đã làm xong project, cảm giác thật nhẹ nhõm!",
    "Cà phê sáng là bắt buộc ☕",
    "Chia sẻ một chút niềm vui nhỏ",
    "Làm việc từ nhà cũng thú vị lắm",
    "Tối nay có ai đi ăn không?",
    "Học cái mới mỗi ngày",
    "Cuộc sống thật tuyệt vời!",
    "Chúc mọi người một ngày tốt lành!",
    "Đang nghe nhạc, rất chill 🎵",
    "Sáng nay chạy bộ 5km, cảm giác sướng!",
    "Nấu ăn là đam mê của tôi 🍳",
    "Đọc sách cuối tuần 📚",
    "Coffee time với bạn bè",
    "Xem phim cuối tuần, phim hay quá!",
    "Làm việc chăm chỉ, chơi hết mình",
    "Mùa thu đến rồi 🍂",
    "Chụp ảnh lưu giữ khoảnh khắc",
    "Hạnh phúc là những điều giản đơn"
]

class SeedDataGenerator:
    def __init__(self):
        self.users: List[Dict] = []
        self.relations: List[Dict] = []
        self.posts: List[Dict] = []
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })

    def log(self, message: str, level: str = "INFO"):
        """Print log message with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] [{level}] {message}")

    def create_user(self, index: int) -> Optional[Dict]:
        """Create a single user via registration endpoint"""
        try:
            username = f"user{index:03d}"
            password = "Password123"
            email = f"{username}@example.com"

            # Register user
            register_data = {
                "username": username,
                "password": password,
                "email": email,
            }

            response = self.session.post(
                f"{IDENTITY_URL}/users/registration",
                json=register_data,
                timeout=10
            )

            if response.status_code in [200, 201]:
                user_response = response.json()
                user_id = user_response.get('result', {}).get('id')

                # Login to get token
                login_data = {
                    "username": username,
                    "password": password
                }

                login_response = self.session.post(
                    f"{IDENTITY_URL}/auth/token",
                    json=login_data,
                    timeout=10
                )

                if login_response.status_code in [200, 201]:
                    auth_response = login_response.json()
                    token = auth_response.get('result', {}).get('token')

                    user_info = {
                        'id': user_id,
                        'username': username,
                        'password': password,
                        'token': token,
                        'email': email,
                    }

                    self.log(f"Created user: {username} (ID: {user_id})")
                    return user_info
                else:
                    self.log(f"Login failed for {username}: {login_response.text}", "ERROR")
            else:
                self.log(f"Registration failed for {username}: {response.text}", "ERROR")

        except Exception as e:
            self.log(f"Error creating user {index}: {str(e)}", "ERROR")

        return None

    def create_profile(self, user: Dict) -> bool:
        """Create/update profile for a user via my-profile endpoint"""
        try:
            headers = {
                'Authorization': f'Bearer {user["token"]}',
                'Content-Type': 'application/json'
            }

            # Use UpdateProfileRequest DTO structure
            profile_data = {
                "lastname": user['lastname'],
                "firstname": user['firstname'],
                "birthday": user['birthday'],
                "city": user['city'],
                "email": user['email']
            }

            response = self.session.put(
                f"{PROFILE_URL}/my-profile",
                json=profile_data,
                headers=headers,
                timeout=10
            )

            if response.status_code in [200, 201]:
                self.log(f"Created profile for {user['username']}")
                return True
            else:
                self.log(f"Profile creation failed for {user['username']}: {response.text}", "ERROR")

        except Exception as e:
            self.log(f"Error creating profile for {user['username']}: {str(e)}", "ERROR")

        return False

    def send_friend_request(self, sender: Dict, receiver_id: str) -> Optional[str]:
        """Send friend request from sender to receiver"""
        try:
            headers = {
                'Authorization': f'Bearer {sender["token"]}',
                'Content-Type': 'application/json'
            }

            relation_data = {
                "participantIds": [sender["id"], receiver_id]
            }

            response = self.session.post(
                f"{RELATION_URL}/pending",
                json=relation_data,
                headers=headers,
                timeout=10
            )

            if response.status_code in [200, 201]:
                relation_response = response.json()
                relation_id = relation_response.get('result', {}).get('id')
                self.log(f"Friend request sent from {sender['username']} to {receiver_id}")
                return relation_id
            else:
                self.log(f"Friend request failed: {response.text}", "ERROR")

        except Exception as e:
            self.log(f"Error sending friend request: {str(e)}", "ERROR")

        return None

    def accept_friend_request(self, user: Dict, relation_id: str) -> bool:
        """Accept friend request"""
        try:
            headers = {
                'Authorization': f'Bearer {user["token"]}',
                'Content-Type': 'application/json'
            }

            response = self.session.put(
                f"{RELATION_URL}/accept/{relation_id}",
                headers=headers,
                timeout=10
            )

            if response.status_code in [200, 201]:
                self.log(f"Friend request accepted (relation_id: {relation_id})")
                return True
            else:
                self.log(f"Accept friend failed: {response.text}", "ERROR")

        except Exception as e:
            self.log(f"Error accepting friend request: {str(e)}", "ERROR")

        return False

    def block_user(self, user: Dict, relation_id: str) -> bool:
        """Block user"""
        try:
            headers = {
                'Authorization': f'Bearer {user["token"]}',
                'Content-Type': 'application/json'
            }

            response = self.session.put(
                f"{RELATION_URL}/block/{relation_id}",
                headers=headers,
                timeout=10
            )

            if response.status_code in [200, 201]:
                self.log(f"User blocked (relation_id: {relation_id})")
                return True
            else:
                self.log(f"Block user failed: {response.text}", "ERROR")

        except Exception as e:
            self.log(f"Error blocking user: {str(e)}", "ERROR")

        return False

    def create_post(self, user: Dict) -> bool:
        """Create a post for a user"""
        try:
            headers = {
                'Authorization': f'Bearer {user["token"]}'
            }

            # Post requires multipart/form-data
            files = {}
            data = {
                'content': random.choice(VIETNAMESE_POSTS)
            }

            response = self.session.post(
                f"{POST_URL}/create",
                headers=headers,
                data=data,
                files=files,
                timeout=10
            )

            if response.status_code in [200, 201]:
                self.log(f"Post created by {user['username']}")
                return True
            else:
                self.log(f"Post creation failed for {user['username']}: {response.text}", "ERROR")

        except Exception as e:
            self.log(f"Error creating post for {user['username']}: {str(e)}", "ERROR")

        return False

    def generate_users(self, count: int = 50):
        """Generate users with profiles"""
        self.log(f"=== STEP 1: Creating {count} users ===")

        for i in range(1, count + 1):
            user = self.create_user(i)
            if user:
                self.users.append(user)
                # Create profile for the user
                time.sleep(0.1)  # Small delay to avoid overwhelming the server
                self.create_profile(user)

            # Progress indicator
            if i % 10 == 0:
                self.log(f"Progress: {i}/{count} users created")

        self.log(f"=== STEP 1 COMPLETED: {len(self.users)} users created ===")

    def build_social_graph(self):
        """Build social graph with different friend distributions"""
        self.log("=== STEP 2: Building Social Graph ===")

        if len(self.users) < 50:
            self.log(f"Not enough users ({len(self.users)}), need at least 50", "ERROR")
            return

        # Group A: Users 1-5 (Highly connected, 12-20 friends each)
        group_a = self.users[0:5]
        self.log(f"Group A: {len(group_a)} users (12-20 friends each)")

        # Create cross-connections within Group A
        for i, user in enumerate(group_a):
            friend_count = random.randint(12, 20)
            potential_friends = [u for u in group_a if u['id'] != user['id']]

            for friend in potential_friends[:friend_count]:
                if random.random() > 0.5:  # 50% chance to avoid duplicates
                    relation_id = self.send_friend_request(user, friend['id'])
                    if relation_id:
                        time.sleep(0.05)
                        self.accept_friend_request(friend, relation_id)
                        time.sleep(0.05)

        # Group B: Users 6-30 (Medium connected, 4-8 friends each)
        group_b = self.users[5:30]
        self.log(f"Group B: {len(group_b)} users (4-8 friends each)")

        for user in group_b:
            friend_count = random.randint(4, 8)
            # Mix of friends from Group A and Group B
            potential_friends = group_a + [u for u in group_b if u['id'] != user['id']]
            random.shuffle(potential_friends)

            for friend in potential_friends[:friend_count]:
                if random.random() > 0.5:
                    relation_id = self.send_friend_request(user, friend['id'])
                    if relation_id:
                        time.sleep(0.05)
                        self.accept_friend_request(friend, relation_id)
                        time.sleep(0.05)

        # Group C: Users 31-44 (Low connected, 1-3 friends each)
        group_c = self.users[30:44]
        self.log(f"Group C: {len(group_c)} users (1-3 friends each)")

        for user in group_c:
            friend_count = random.randint(1, 3)
            potential_friends = [u for u in self.users if u['id'] != user['id']]
            random.shuffle(potential_friends)

            for friend in potential_friends[:friend_count]:
                if random.random() > 0.5:
                    relation_id = self.send_friend_request(user, friend['id'])
                    if relation_id:
                        time.sleep(0.05)
                        self.accept_friend_request(friend, relation_id)
                        time.sleep(0.05)

        # Group D: Users 45-50 (No friends - Cold Start)
        group_d = self.users[44:50]
        self.log(f"Group D: {len(group_d)} users (0 friends - Cold Start)")

        # Create 10 PENDING relations
        self.log("Creating 10 PENDING relations...")
        pending_count = 0
        for _ in range(20):  # Try 20 times to get 10 successful
            if pending_count >= 10:
                break
            user1 = random.choice(self.users)
            user2 = random.choice([u for u in self.users if u['id'] != user1['id']])
            relation_id = self.send_friend_request(user1, user2['id'])
            if relation_id:
                pending_count += 1
                time.sleep(0.05)

        # Create 3 BLOCKED relations
        self.log("Creating 3 BLOCKED relations...")
        blocked_count = 0
        for _ in range(10):  # Try 10 times to get 3 successful
            if blocked_count >= 3:
                break
            user1 = random.choice(self.users)
            user2 = random.choice([u for u in self.users if u['id'] != user1['id']])
            relation_id = self.send_friend_request(user1, user2['id'])
            if relation_id:
                time.sleep(0.05)
                if self.block_user(user1, relation_id):
                    blocked_count += 1
                time.sleep(0.05)

        self.log("=== STEP 2 COMPLETED: Social graph built ===")

    def generate_posts(self):
        """Generate posts from Group A and B users"""
        self.log("=== STEP 3: Creating Posts ===")

        # Group A and B users (indices 0-29)
        active_users = self.users[0:30]
        self.log(f"Creating posts from {len(active_users)} active users")

        post_count = 0
        target_posts = 50  # Target 50 posts total

        while post_count < target_posts:
            user = random.choice(active_users)
            if self.create_post(user):
                post_count += 1
            time.sleep(0.1)  # Small delay between posts

        self.log(f"=== STEP 3 COMPLETED: {post_count} posts created ===")

    def run(self):
        """Run the complete seed data generation"""
        start_time = datetime.now()
        self.log("=== STARTING SEED DATA GENERATION ===")

        try:
            # Step 1: Create users
            self.generate_users(50)

            if len(self.users) < 10:
                self.log("Not enough users created, aborting", "ERROR")
                return

            # Step 2: Build social graph
            self.build_social_graph()

            # Step 3: Create posts
            self.generate_posts()

            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()

            self.log("=== SEED DATA GENERATION COMPLETED ===")
            self.log(f"Total time: {duration:.2f} seconds")
            self.log(f"Total users: {len(self.users)}")

        except KeyboardInterrupt:
            self.log("Script interrupted by user", "WARNING")
        except Exception as e:
            self.log(f"Unexpected error: {str(e)}", "ERROR")


def main():
    """Main entry point"""
    print("Social App Seed Data Generator")
    print("=" * 50)
    print("This script will create:")
    print("- 50 users with profiles")
    print("- Social graph with varying friend counts")
    print("- Sample posts")
    print("=" * 50)

    # Check if services are running
    try:
        response = requests.get(f"{API_GATEWAY_URL}/actuator/health", timeout=3)
        if response.status_code == 200:
            print("API Gateway is running normally.")
        else:
            print(f"API Gateway reachable (status code {response.status_code}).")
    except Exception:
        print("WARNING: Could not connect to API Gateway. Make sure services are running.")
        print("Press Enter to continue anyway or Ctrl+C to cancel...")
        input()

    generator = SeedDataGenerator()
    generator.run()


if __name__ == "__main__":
    main()