package edu.cit.ursulo.bytezone.orders;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import edu.cit.ursulo.bytezone.snacks.Snack;
import jakarta.persistence.*;
import java.math.BigDecimal;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private SnackOrder order;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "snack_id")
    private Snack snack;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    public OrderItem() {
    }

    public Long getId() {
        return id;
    }

    public SnackOrder getOrder() {
        return order;
    }

    public Snack getSnack() {
        return snack;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setOrder(SnackOrder order) {
        this.order = order;
    }

    public void setSnack(Snack snack) {
        this.snack = snack;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}