const mockCurrentUser = {
  name: "Nguyen Tan Thanh",
  avatarUrl: "https://i.pravatar.cc/150?img=15",
};

const cloneFile = (file) => ({
  ...file,
});

const clonePost = (post) => ({
  ...post,
  images: [...(post.images || [])],
  files: (post.files || []).map(cloneFile),
});

const cloneRequest = (request) => ({
  ...request,
});

const createFilesFromImages = (images) => images.map((url) => ({ url }));

const createSeededRandom = (seed) => {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const randomInt = (random, min, max) => Math.floor(random() * (max - min + 1)) + min;

const pick = (random, values) => values[Math.floor(random() * values.length)];

const formatTimeAgo = (hoursAgo) => {
  if (hoursAgo < 1) {
    return "Just now";
  }

  if (hoursAgo < 24) {
    return `${hoursAgo} hour${hoursAgo === 1 ? "" : "s"} ago`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
};

const baseTime = new Date("2026-07-25T12:00:00.000Z").getTime();

const firstNames = [
  "Linh",
  "Huy",
  "Trang",
  "Khanh",
  "Phuong",
  "Bao",
  "Mai",
  "Duc",
  "Thao",
  "Quang",
  "Yen",
  "Gia",
  "Nhat",
  "Anh",
  "Tuan",
  "Ngoc",
  "Minh",
  "Thanh",
  "Thien",
  "Diep",
];

const lastNames = [
  "Tran",
  "Nguyen",
  "Le",
  "Pham",
  "Vu",
  "Hoang",
  "Phan",
  "Do",
  "Bui",
  "Dao",
];

const postTopics = [
  "shipping a UI polish pass",
  "tuning the feed layout",
  "testing the optimistic update flow",
  "reviewing profile card spacing",
  "checking mobile responsiveness",
  "building friend suggestion cards",
  "stress testing infinite scrolling",
  "watching the avatar state updates",
  "reworking the composer preview",
  "verifying comment counters",
];

const postAngles = [
  "The layout held up better than expected.",
  "The page feels stable even with a long list.",
  "This should make backend swaps easier later.",
  "We can now exercise the full scrolling experience.",
  "The mock data gives a much better signal for spacing issues.",
  "This is a good checkpoint for regression testing.",
];

const imagePool = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522543558187-768b6df7c25c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531497865144-0464ef8fb9f1?auto=format&fit=crop&w=1200&q=80",
];

const requestNames = [
  "Mai Pham",
  "Duc Hoang",
  "Thao Linh",
  "Quang Minh",
  "Yen Nhi",
  "Gia Bao",
  "Nhat Vy",
  "Anh Khoa",
  "Hong Anh",
  "Tuan Kiet",
  "Bao Chau",
  "Lan Anh",
  "Son Tung",
  "Minh Anh",
  "Trung Hieu",
  "Phuc Long",
];

const suggestionNames = [
  "Quang Minh",
  "Yen Nhi",
  "Gia Bao",
  "Nhat Vy",
  "Anh Khoa",
  "Hong Anh",
  "Tuan Kiet",
  "Bao Chau",
  "Lan Anh",
  "Son Tung",
  "Minh Anh",
  "Trung Hieu",
  "Phuc Long",
  "Tuyet Mai",
  "Khanh Vy",
  "Duy Khang",
  "Diem My",
  "Hoang Nam",
];

const mutualFriendDescriptors = [
  "Trung Nguyen",
  "Ngoc Anh",
  "3 people you know",
  "Long Tran",
  "5 mutual friends",
  "Your colleague",
  "A classmate",
  "Recent connection",
];

const avatarForIndex = (offset) => `https://i.pravatar.cc/150?img=${((offset * 7) % 70) + 1}`;

const buildAuthorName = (index) => {
  const random = createSeededRandom(index + 17);
  return `${pick(random, firstNames)} ${pick(random, lastNames)}`;
};

const buildPostContent = (random, authorName, topic) => {
  const intro = pick(random, [
    `${authorName} is ${topic}`,
    `Quick note while ${authorName} is ${topic}`,
    `${authorName} spent time ${topic}`,
  ]);

  return `${intro}. ${pick(random, postAngles)}`;
};

const buildPostImages = (random, index) => {
  if (index % 3 === 0) {
    const imageCount = randomInt(random, 1, 3);
    const images = [];

    for (let imageIndex = 0; imageIndex < imageCount; imageIndex += 1) {
      images.push(pick(random, imagePool));
    }

    return images;
  }

  return index % 5 === 0 ? [pick(random, imagePool)] : [];
};

const buildCreatedDate = (index) => {
  const hoursAgo = index * 2 + (index % 5);
  return new Date(baseTime - hoursAgo * 60 * 60 * 1000).toISOString();
};

const buildPost = (index) => {
  const random = createSeededRandom(index + 101);
  const authorName = buildAuthorName(index);
  const images = buildPostImages(random, index);

  return {
    postId: `post-${1000 + index}`,
    authorName,
    name: authorName,
    avatar: avatarForIndex(index),
    avatarUrl: avatarForIndex(index),
    timestamp: formatTimeAgo(index * 2 + (index % 5)),
    createdDate: buildCreatedDate(index),
    content: buildPostContent(random, authorName, pick(random, postTopics)),
    images,
    files: createFilesFromImages(images),
    likeCount: randomInt(random, 0, 850),
    commentCount: randomInt(random, 0, 120),
    liked: random() > 0.5,
    score: 100000 - index,
  };
};

const buildFriendRequest = (index) => {
  const random = createSeededRandom(index + 501);
  const conversationName = requestNames[index % requestNames.length];

  return {
    id: `request-${2000 + index}`,
    relationId: `relation-${2000 + index}`,
    conversationName,
    avatar: avatarForIndex(index + 20),
    mutualFriends: randomInt(random, 1, 18),
    followed: pick(random, mutualFriendDescriptors),
  };
};

const buildSuggestion = (index) => {
  const random = createSeededRandom(index + 901);
  const username = suggestionNames[index % suggestionNames.length];

  return {
    id: `suggestion-${3000 + index}`,
    userId: `user-${3000 + index}`,
    username,
    avatar: avatarForIndex(index + 40),
    mutualFriends: randomInt(random, 0, 16),
  };
};

export const mockPosts = Array.from({ length: 180 }, (_, index) => buildPost(index));

export const mockFriendRequests = Array.from({ length: 40 }, (_, index) => buildFriendRequest(index));

export const mockFriendSuggestions = Array.from({ length: 45 }, (_, index) => buildSuggestion(index));

let feedStore = mockPosts.map(clonePost);
let friendRequestStore = mockFriendRequests.map(cloneRequest);
let friendSuggestionStore = mockFriendSuggestions.map(cloneRequest);

const createStorePostId = () => `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const resolveImageUrl = (file) => {
  if (typeof file === "string") {
    return file;
  }

  if (file?.preview) {
    return file.preview;
  }

  if (typeof File !== "undefined" && file instanceof File) {
    return URL.createObjectURL(file);
  }

  return file?.url || "";
};

export const getMockCurrentUser = () => ({ ...mockCurrentUser });

export const getMockFeedSnapshot = () => feedStore.map(clonePost);

export const getMockFriendRequestSnapshot = () => friendRequestStore.map(cloneRequest);

export const getMockFriendSuggestionSnapshot = () => friendSuggestionStore.map(cloneRequest);

export const createMockFeedPost = (content, files = []) => {
  const images = files.map(resolveImageUrl).filter(Boolean);
  const post = {
    postId: createStorePostId(),
    authorName: mockCurrentUser.name,
    name: mockCurrentUser.name,
    avatar: mockCurrentUser.avatarUrl,
    avatarUrl: mockCurrentUser.avatarUrl,
    timestamp: "Just now",
    createdDate: new Date().toISOString(),
    content,
    images,
    files: createFilesFromImages(images),
    likeCount: 0,
    commentCount: 0,
    liked: false,
    score: Date.now(),
  };

  feedStore = [post, ...feedStore];

  return clonePost(post);
};

export const toggleMockPostLike = (postId) => {
  let likedPost = null;

  feedStore = feedStore.map((post) => {
    if (post.postId !== postId) {
      return post;
    }

    const liked = !post.liked;
    const likeCount = Math.max(0, (post.likeCount || 0) + (liked ? 1 : -1));
    likedPost = {
      ...post,
      liked,
      likeCount,
    };

    return likedPost;
  });

  return likedPost ? clonePost(likedPost) : null;
};

export const acceptMockFriendRequest = (relationId) => {
  const acceptedRequest = friendRequestStore.find((request) => request.relationId === relationId) || null;

  if (acceptedRequest) {
    friendRequestStore = friendRequestStore.filter((request) => request.relationId !== relationId);
  }

  return acceptedRequest ? cloneRequest(acceptedRequest) : null;
};

export const deleteMockFriendRequest = (id) => {
  const deletedRequest = friendRequestStore.find((request) => request.id === id) || null;

  if (deletedRequest) {
    friendRequestStore = friendRequestStore.filter((request) => request.id !== id);
  }

  return deletedRequest ? cloneRequest(deletedRequest) : null;
};

export const sendMockFriendRequest = (friendId) => {
  const removedSuggestion = friendSuggestionStore.find((suggestion) => suggestion.userId === friendId) || null;

  if (removedSuggestion) {
    friendSuggestionStore = friendSuggestionStore.filter((suggestion) => suggestion.userId !== friendId);
  }

  return removedSuggestion ? cloneRequest(removedSuggestion) : null;
};

export const getMockFeedPaginated = (page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = feedStore.slice(startIndex, endIndex);
  
  return {
    data: {
      result: items,
      hasMore: endIndex < feedStore.length,
      total: feedStore.length,
    }
  };
};

export const getMockFeedByCheckpoint = (checkpoint, size = 3) => {
  const allPosts = feedStore.map(clonePost);
  
  let startIndex = 0;
  if (checkpoint) {
    const foundIndex = allPosts.findIndex((p) => p.postId === checkpoint);
    if (foundIndex !== -1) {
      startIndex = foundIndex + 1;
    }
  }

  const paginatedPosts = allPosts.slice(startIndex, startIndex + size);
  
  return {
    data: {
      result: {
        data: paginatedPosts,
        nextCheckpoint: paginatedPosts.length > 0 ? paginatedPosts[paginatedPosts.length - 1].postId : null,
        hasMore: startIndex + size < allPosts.length,
      },
    },
  };
};


// --- MOCK COMMENTS STORE & GENERATOR ---

const commentNames = [
  "Linh Le", "Huy Tran", "Trang Pham", "Khanh Vu", "Phuong Hoang", 
  "Bao Phan", "Mai Do", "Duc Bui", "Thao Dao", "Quang Huy",
  "Yen Nhi", "Gia Bao", "Nhat Linh", "Anh Tuan", "Ngoc Mai"
];

const commentContents = [
  "Chính xác luôn, đoạn này nhìn mượt phết!",
  "Cái này hình như còn một edge-case ở mobile nữa đấy nhé.",
  "Tuyệt vời ông mặt trời, đẩy lên production thôi ae ơi 🚀",
  "Cho xin source code tham khảo với chủ thớt ơi.",
  "Mình test thử trên Safari thấy đôi khi bị giật nhẹ ở đoạn scroll.",
  "Chuẩn bài rồi, kiến trúc này tách biệt tầng dữ liệu rất tốt.",
  "Đang hóng phần tiếp theo của series này đấy nhé!",
  "Góp ý nhỏ là khoảng cách padding chỗ này hơi sát nhau quá.",
  "Đã test và chạy rất ổn định trên thiết bị của mình.",
  "Tuyệt vời! Code rất sạch và dễ đọc."
];

// Tạo sẵn kho lưu trữ comment cho từng bài post (Mỗi bài có sẵn từ 8 đến 12 comment để test load more)
const commentStore = {};

const generateCommentsForPost = (postId) => {
  const random = createSeededRandom(parseInt(postId.replace(/[^0-9]/g, "")) || 123);
  const totalComments = randomInt(random, 8, 14); // Mỗi bài có từ 8 - 14 comment
  const comments = [];

  for (let i = 0; i < totalComments; i++) {
    const authorName = pick(random, commentNames);
    comments.push({
      commentId: `comment-${postId}-${i + 1}`,
      postId: postId,
      authorName: authorName,
      avatar: avatarForIndex(i + 50),
      content: pick(random, commentContents),
      timestamp: formatTimeAgo((i + 1) * 3), // Thời gian cách nhau ra
      likes: randomInt(random, 0, 15),
    });
  }
  return comments;
};

// Hàm API Mock để lấy danh sách comment có phân trang (Pagination)
export const getMockCommentsByPostId = async (postId, page = 1, limit = 3) => {
  // Đảm bảo bài viết nào cũng có kho comment riêng
  if (!commentStore[postId]) {
    commentStore[postId] = generateCommentsForPost(postId);
  }

  const allPostComments = commentStore[postId];
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = allPostComments.slice(startIndex, endIndex);

  // Giả lập độ trễ mạng (Network Latency) 400ms để test trạng thái Loading mượt mà hơn
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    data: {
      result: paginatedItems,
      currentPage: page,
      hasMore: endIndex < allPostComments.length,
      total: allPostComments.length,
    }
  };
};

// Hàm hỗ trợ thêm comment mới (Optimistic Update test)
export const addMockComment = (postId, content) => {
  if (!commentStore[postId]) {
    commentStore[postId] = generateCommentsForPost(postId);
  }

  const newComment = {
    commentId: `comment-${postId}-${Date.now()}`,
    postId: postId,
    authorName: mockCurrentUser.name,
    avatar: mockCurrentUser.avatarUrl,
    content: content,
    timestamp: "Just now",
    likes: 0,
  };

  // Thêm vào đầu hoặc cuối tùy ý (thường comment mới sẽ nằm ở dưới cùng)
  commentStore[postId].push(newComment);

  return {
    data: {
      result: newComment,
    }
  };
};