package com.ntt.relation_service.enums;

public enum RelationStatus {
    PENDING,   // Đã gửi lời mời kết bạn, chưa được chấp nhận
    ACCEPTED,  // Đã trở thành bạn bè
    REJECTED,  // Lời mời bị từ chối
    BLOCKED,    // Một trong hai bên chặn người kia

}
