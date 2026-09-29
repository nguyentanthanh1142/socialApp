package com.ntt.identity_service.service;

import java.util.HashSet;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ntt.identity_service.constant.PredefindRole;
import com.ntt.identity_service.entity.Role;
import com.ntt.identity_service.entity.User;
import com.ntt.identity_service.enums.UserStatus;
import com.ntt.identity_service.repository.RoleRepository;
import com.ntt.identity_service.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DataInitializerService {

    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    UserRepository userRepository;

    @Transactional
    public void initAdminUser() {
        Role adminRole = roleRepository
                .findById(PredefindRole.ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(PredefindRole.ADMIN)
                        .description("Administrator")
                        .build()));

        roleRepository
                .findById(PredefindRole.USER)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(PredefindRole.USER)
                        .description("User")
                        .build()));

        User admin = userRepository.findByUsername("admin").orElseGet(() -> {
            var roles = new HashSet<Role>();
            roles.add(adminRole);
            User user = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .email("admin@ntt.com")
                    .emailVerified(true)
                    .status(UserStatus.ACTIVE)
                    .roles(roles)
                    .build();
            log.warn("admin user has been created with default password: admin");
            return userRepository.save(user);
        });

        boolean missingAdminRole = admin.getRoles() == null
                || admin.getRoles().stream().noneMatch(role -> PredefindRole.ADMIN.equals(role.getName()));

        if (missingAdminRole) {
            var roles = admin.getRoles() == null ? new HashSet<Role>() : new HashSet<>(admin.getRoles());
            roles.add(adminRole);
            admin.setRoles(roles);
            if (admin.getStatus() == null) {
                admin.setStatus(UserStatus.ACTIVE);
            }
            userRepository.save(admin);
            log.warn("ADMIN role assigned to existing admin user");
        }
    }
}