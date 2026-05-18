package edu.cit.ursulo.bytezone.snacks;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SnackService {

    private final SnackRepository snackRepository;

    public SnackService(SnackRepository snackRepository) {
        this.snackRepository = snackRepository;
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
}