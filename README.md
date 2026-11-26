# Haven — Smart Home Web Application

A responsive front-end prototype inspired by the uploaded literature review, **“IoT-Based Smart Home Automation System.”** It uses a restrained sage, warm-white, and soft-neutral palette.

## Run it

1. Extract the ZIP.
2. Open the `Haven_Smart_Home` folder in VS Code.
3. Open a terminal in that folder and run `py -m http.server 8000` (Windows) or `python3 -m http.server 8000` (macOS/Linux). VS Code Live Server also works.
4. Visit `http://localhost:8000`.

No build step, npm install, or API key is required. An internet connection is needed for the map and weather/geocoding services.

## Main features

- Responsive dashboard, device controls, routines, activity timeline and settings.
- Sensor Room with a working embedded map, searchable location and outdoor weather.
- Search for a city, town or area (for example, `Mysuru, Karnataka` or `Chennai`). Open-Meteo Geocoding resolves the place to coordinates; Open-Meteo Forecast then supplies current temperature, humidity, wind, today's minimum and maximum.
- The embedded map and external map link follow the searched place.
- Three-house comparison for the same searched location:
  - **House A — Fully IoT integrated:** smart thermostat, automated fans/blinds and room sensors; strongest temperature regulation.
  - **House B — Non-IoT:** no automated climate control; indoor rooms respond more strongly to outdoor conditions.
  - **House C — Partially IoT integrated:** selected smart appliances and moderate temperature regulation.
- Each house shows modelled Kitchen, Living room, Bedroom and Bathroom temperatures. Changing the searched location updates all twelve estimates using that location's live daily weather range.
- Indoor blueprint mirrors the fully IoT house and supports selectable room sensors.
- Temperature refresh button and automatic weather refresh every 15 minutes.
- Browser-local preferences and device/routine state.

## Data and modelling notes

- **Outdoor weather:** live API data from Open-Meteo Forecast. The daily minimum/maximum and current temperature are location-specific. **Geocoding:** Open-Meteo Geocoding.
- **Indoor temperatures:** these are transparent *model estimates*, not physical sensor measurements. The app derives a daily outdoor mean from the forecast and applies different thermal-response factors and room offsets for each home profile. The kitchen is modelled warmer than the bedroom. This makes the three homes respond differently when the searched place changes without falsely claiming that Kaggle or a weather API measured the inside of these demo houses.
- If geocoding or weather cannot be reached, the app displays an error/offline state rather than making up new outdoor readings. Previously loaded house values remain visible until new weather is available.
- The map is an embedded public Google Maps view and is not used to obtain weather data. If an institution network blocks the embed, the external map link remains available.

## Room climate control and hardware simulation

In **Sensor room → Room climate control**, pressing **Adjust room temperature** reads the outdoor temperature (live, or a typed value such as 25), picks a target inside the 15–19°C comfort band (25°C → 19°C, 30°C → 17°C, 35°C → 15°C), sends it to the hardware controller, and runs the AC until the room reaches the target.

- **Virtual hardware (default):** an on-page circuit (sensor, Arduino, relay, AC motor, louver, LCD, LEDs) running the same control rule as the Arduino sketch.
- **Tinkercad Circuits:** build the circuit from `hardware/TINKERCAD_SETUP.md`, paste `hardware/haven_ac_controller.ino`, then use **Copy Tinkercad command** and paste it into the Serial Monitor. Tinkercad cannot be linked to a web page directly, so this step is copy and paste.
- **Real Arduino:** **Connect real Arduino (USB)** uses the Web Serial API (Chrome or Edge) to exchange the same messages live.

## Important limitations

This is a **front-end demonstration only**. Apart from the optional USB serial link described above, it is not connected to ESP32/ESP8266 hardware, a relay board, MQTT broker, Home Assistant, or physical room sensors. The three-house indoor values are modelled for comparison, not live IoT telemetry. Device buttons and routines update the local interface only; no real appliance is controlled and no safety hazard can be detected.

For a real IoT deployment, connect each house profile to authenticated device telemetry (for example, ESP32 + temperature/humidity sensors), store per-house readings on a backend, and keep simulated estimates visually separate from measured sensor data.

## Project structure

- `index.html` — page structure and views
- `styles.css` — responsive design and layouts
- `app.js` — UI state, geocoding, weather requests, thermal estimates and interactions
- `README.md` — setup and implementation notes
- `LITERATURE_REVIEW_NOTES.md` — implementation mapping to the source review
