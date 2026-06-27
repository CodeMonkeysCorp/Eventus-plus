package com.eventusplus.user.service;

import com.eventusplus.security.model.UserPrincipal;
import com.eventusplus.user.dto.UserCreateRequest;
import com.eventusplus.user.dto.UserResponse;
import com.eventusplus.user.dto.UserStatusRequest;
import com.eventusplus.user.dto.UserUpdateRequest;
import java.util.List;

public interface UserManagementService {

    List<UserResponse> listAll();

    UserResponse create(UserCreateRequest request, UserPrincipal principal, String ipAddress);

    UserResponse update(Long userId, UserUpdateRequest request, UserPrincipal principal, String ipAddress);

    UserResponse updateStatus(Long userId, UserStatusRequest request, UserPrincipal principal, String ipAddress);
}
