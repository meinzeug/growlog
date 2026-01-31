export const translations = {
    en: {
        dashboard: 'Dashboard',
        grows: 'Grows',
        plants: 'Plants',
        calendar: 'Calendar',
        reports: 'Reports',
        tools: 'Tools',
        settings: 'Settings',
        users: 'Users',
        signout: 'Sign Out',

        // Dashboard
        hello: 'Hello!',
        total_plants: 'Total plants',
        active_plants: 'Active plants',
        healthy_plants: 'Healthy plants',
        with_issues: 'With Issues',
        growth_chart: 'Plant growth (Avg Height)',
        week: 'Week',

        // Right Panel
        current_plant: 'Current Plant',
        light: 'Light',
        temperature: 'Temperature',
        humidity: 'Humidity',
        details: 'Details',
        record: 'Record',
        no_image: 'No Image',
        no_plants: 'No plants found.',
        add_plant_hint: 'Add a plant to see details here.',

        // Modal
        record_data: 'Record Data',
        height: 'Height',
        ph_level: 'pH Level',
        ec_ppm: 'EC / PPM',
        environment: 'Environment',
        notes: 'Notes (Optional)',
        cancel: 'Cancel',
        save_record: 'Save Record',
        saving: 'Saving...',

        // General
        loading: 'Loading...',
        // Tools
        vpd_calc: 'VPD Calculator',
        dli_calc: 'DLI Calculator',
        air_temp: 'Air Temperature (°C)',
        leaf_temp_offset: 'Leaf Temp Offset (°C)',
        humidity_rh: 'Relative Humidity (%)',
        target_vpd: 'Target VPD',
        vp_deficit: 'Vapor Pressure Deficit',
        ppfd: 'PPFD (µmol/m²/s)',
        hours_on: 'Light Hours per Day',
        daily_light_integral: 'Daily Light Integral',
        mol_m2_d: 'mol/m²/d',
        vpd_hint: 'Vegetative: 0.8-1.1 | Flowering: 1.2-1.5 kPa',
        dli_hint: 'Vegetative: 15-40 | Flowering: 30-50+ mol/m²/d',
    },
    de: {
        dashboard: 'Übersicht',
        grows: 'Züchtungen',
        plants: 'Pflanzen',
        calendar: 'Kalender',
        reports: 'Berichte',
        tools: 'Werkzeuge',
        settings: 'Einstellungen',
        users: 'Benutzer',
        signout: 'Abmelden',

        // Dashboard
        hello: 'Hallo!',
        total_plants: 'Gesamt Pflanzen',
        active_plants: 'Aktive Pflanzen',
        healthy_plants: 'Gesunde Pflanzen',
        with_issues: 'Mit Problemen',
        growth_chart: 'Pflanzenwachstum (Ø Höhe)',
        week: 'Woche',

        // Right Panel
        current_plant: 'Aktuelle Pflanze',
        light: 'Licht',
        temperature: 'Temperatur',
        humidity: 'Feuchtigkeit',
        details: 'Details',
        record: 'Aufzeichnen',
        no_image: 'Kein Bild',
        no_plants: 'Keine Pflanzen gefunden.',
        add_plant_hint: 'Füge eine Pflanze hinzu, um Details zu sehen.',

        // Modal
        record_data: 'Daten erfassen',
        height: 'Höhe',
        ph_level: 'pH-Wert',
        ec_ppm: 'EC / PPM',
        environment: 'Umgebung',
        notes: 'Notizen (Optional)',
        cancel: 'Abbrechen',
        save_record: 'Speichern',
        saving: 'Speichert...',

        // General
        loading: 'Lädt...',

        // Tools
        vpd_calc: 'VPD Rechner',
        dli_calc: 'DLI Rechner',
        air_temp: 'Lufttemperatur (°C)',
        leaf_temp_offset: 'Blatttemperatur Offset (°C)',
        humidity_rh: 'Relative Luftfeuchtigkeit (%)',
        target_vpd: 'Ziel VPD',
        vp_deficit: 'Dampfdruckdefizit',
        ppfd: 'PPFD (µmol/m²/s)',
        hours_on: 'Lichtstunden pro Tag',
        daily_light_integral: 'Tägliche Lichtmenge (DLI)',
        mol_m2_d: 'mol/m²/d',
        vpd_hint: 'Wachstum: 0.8-1.1 | Blüte: 1.2-1.5 kPa',
        dli_hint: 'Wachstum: 15-40 | Blüte: 30-50+ mol/m²/d',
    }
};

export type LanguageType = 'en' | 'de';
