package com.example.scembackend.controller;

import com.example.scembackend.model.WasteItem;
import com.example.scembackend.service.WasteService;
import com.example.scembackend.service.SuggestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waste")
@CrossOrigin(origins = "*")
public class WasteController {

    @Autowired
    private WasteService wasteService;

    @Autowired
    private SuggestionService suggestionService;

    // POST → save waste
    @PostMapping
    public WasteItem addWaste(@RequestBody WasteItem item) {
        return wasteService.saveWaste(item);
    }

    // GET → fetch all waste
    @GetMapping
    public List<WasteItem> getAllWaste() {
        return wasteService.getAllWaste();
    }
    @DeleteMapping("/{id}")
    public void deleteWaste(@PathVariable Long id) {
        wasteService.deleteWaste(id);
    }

    // GET → fetch AI suggestions by waste type
    @GetMapping("/suggestions/{type}")
    public List<String> getSuggestions(@PathVariable String type) {
        return suggestionService.getSuggestions(type);
    }
}