package edu.cit.ursulo.bytezone.snacks;

import edu.cit.ursulo.bytezone.uploads.CloudinaryUploadService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class SnackService {

    private final SnackRepository snackRepository;
    private final CloudinaryUploadService cloudinaryUploadService;

    public SnackService(SnackRepository snackRepository,
                        CloudinaryUploadService cloudinaryUploadService) {
        this.snackRepository = snackRepository;
        this.cloudinaryUploadService = cloudinaryUploadService;
    }

    @Transactional(readOnly = true)
    public List<Snack> getAll() {
        return snackRepository.findAll();
    }

    @Transactional
    public Snack create(SnackRequest request) {
        Snack snack = new Snack();
        snack.setName(request.getName());
        snack.setPrice(request.getPrice());
        snack.setAvailable(request.getAvailable() != null ? request.getAvailable() : true);

        return snackRepository.save(snack);
    }

    @Transactional
    public Snack update(Long snackId, SnackRequest request) {
        Snack snack = snackRepository.findById(snackId)
                .orElseThrow(() -> new RuntimeException("Snack not found"));

        snack.setName(request.getName());
        snack.setPrice(request.getPrice());
        snack.setAvailable(request.getAvailable() != null ? request.getAvailable() : snack.getAvailable());

        return snackRepository.save(snack);
    }

    @Transactional
    public void delete(Long snackId) {
        if (!snackRepository.existsById(snackId)) {
            throw new RuntimeException("Snack not found");
        }

        snackRepository.deleteById(snackId);
    }

    @Transactional
    public Snack updateImage(Long snackId, MultipartFile file) {
        Snack snack = snackRepository.findById(snackId)
                .orElseThrow(() -> new RuntimeException("Snack not found"));

        String imageUrl = cloudinaryUploadService.uploadImage(file, "bytezone/snacks");
        snack.setImageUrl(imageUrl);

        return snackRepository.save(snack);
    }
}