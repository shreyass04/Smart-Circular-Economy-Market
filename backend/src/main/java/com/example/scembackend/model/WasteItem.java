package com.example.scembackend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "waste_items")
public class WasteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;
    private Double quantity;
    private String location;
    private String addedDate;
}