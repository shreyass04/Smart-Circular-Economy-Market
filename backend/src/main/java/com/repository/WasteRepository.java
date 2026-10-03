package com.example.scembackend.repository;

import com.example.scembackend.model.WasteItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WasteRepository extends JpaRepository<WasteItem, Long> {

}