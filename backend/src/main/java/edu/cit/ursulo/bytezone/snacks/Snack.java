package edu.cit.ursulo.bytezone.snacks;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "snacks")
public class Snack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Boolean available;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private String category;

    public Snack() {
    }

    public Snack(String name, BigDecimal price, Boolean available) {
        this.name = name;
        this.price = price;
        this.available = available;
        this.category = "Recommended Offers";
    }

    public Snack(String name, BigDecimal price, Boolean available, String imageUrl, String category) {
        this.name = name;
        this.price = price;
        this.available = available;
        this.imageUrl = imageUrl;
        this.category = category;
    }

    @PrePersist
    public void prePersist() {
        if (this.available == null) {
            this.available = true;
        }

        if (this.category == null || this.category.isBlank()) {
            this.category = "Recommended Offers";
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Boolean getAvailable() {
        return available;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getCategory() {
        return category;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}