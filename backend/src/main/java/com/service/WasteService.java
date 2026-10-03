package com.example.scembackend.service;

import com.example.scembackend.model.WasteItem;
import com.example.scembackend.repository.WasteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WasteService {

    @Autowired
    private WasteRepository wasteRepository;

    public WasteItem saveWaste(WasteItem item) {
        return wasteRepository.save(item);
    }
    public void deleteWaste(Long id) {
        wasteRepository.deleteById(id);
    }

    public List<WasteItem> getAllWaste() {
        return wasteRepository.findAll();
    }
}