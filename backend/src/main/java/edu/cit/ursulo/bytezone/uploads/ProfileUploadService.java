package edu.cit.ursulo.bytezone.uploads;

import edu.cit.ursulo.bytezone.auth.CurrentUserService;
import edu.cit.ursulo.bytezone.users.User;
import edu.cit.ursulo.bytezone.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileUploadService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final CloudinaryUploadService cloudinaryUploadService;

    public ProfileUploadService(CurrentUserService currentUserService,
                                UserRepository userRepository,
                                CloudinaryUploadService cloudinaryUploadService) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.cloudinaryUploadService = cloudinaryUploadService;
    }

    @Transactional
    public User uploadMyProfileImage(MultipartFile file) {
        User user = currentUserService.getCurrentUser();

        String imageUrl = cloudinaryUploadService.uploadImage(
                file,
                "bytezone/profile"
        );

        user.setProfileImageUrl(imageUrl);

        return userRepository.save(user);
    }
}