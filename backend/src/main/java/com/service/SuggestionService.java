package com.example.scembackend.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class SuggestionService {

    // AI Rule-Based Logic
    private static final Map<String, List<String>> suggestionMap = Map.of(
            "Plastic", List.of(
                    "♻️ Recycle into new plastic bottles",
                    "🧱 Use for making eco-bricks",
                    "🛣️ Mix into road construction material",
                    "🪑 Convert into recycled furniture"
            ),
            "Glass", List.of(
                    "🍶 Reuse as storage jars",
                    "🎨 Melt and reshape into decorative items",
                    "🧱 Use in construction blocks",
                    "🪟 Grind into sand substitute"
            ),
            "Metal", List.of(
                    "🔧 Sell to scrap dealers",
                    "⚙️ Re-melt for spare parts",
                    "🛠️ Use for tool refurbishing",
                    "🏗️ Donate to construction sites"
            ),
            "Organic", List.of(
                    "🌱 Perfect for composting",
                    "💧 Use for biogas generation",
                    "🌿 Convert to organic fertilizer",
                    "🐛 Use for vermicomposting"
            ),
            "E-waste", List.of(
                    "💰 Extract precious metals like gold and copper",
                    "💾 Recycle working parts like RAM and chips",
                    "🖥️ Donate to refurbishing centers",
                    "🔋 Safely dispose batteries separately"
            )
    );

    public List<String> getSuggestions(String wasteType) {
        return suggestionMap.getOrDefault(
                wasteType,
                List.of("♻️ Please contact your local recycling center for guidance.")
        );
    }
}