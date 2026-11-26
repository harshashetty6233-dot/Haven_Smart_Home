# Mapping Haven to the literature review

This note maps the front-end prototype to the uploaded review, *IoT-Based Smart Home Automation System*. It intentionally distinguishes the proposed interface from the real-hardware system described in the review.

## Objectives reflected in the interface

1. **Low-cost ESP8266/ESP32-based smart home control:** the Research insights page shows the conceptual controller and communication path. Device controls are currently local UI state, not real hardware control.
2. **Combined appliance control and sensor automation:** the Devices, Automations, and Sensor room pages present these capabilities together.
3. **Secure communication and reliable local operation:** the Research insights page surfaces local-first operation and security as design priorities. No authentication, encryption, broker, or local hub is implemented in this static prototype.
4. **Simple dashboard, scheduling, and manual override:** the interface includes device toggles and routine creation/toggles. Routine triggers are saved as descriptive settings only; they do not execute on a clock or sensor event.
5. **Evaluation:** the interface makes sample values explicit and calls out the measures that should be evaluated on working hardware: response time, switching reliability, sensor accuracy, and alert delivery.

## Literature gaps surfaced as design priorities

The review mentions recurring gaps around security and privacy, limited testing outside laboratory or simulation conditions, lack of quantitative results, cloud dependency, local-device constraints, scalability, and interoperability. Haven turns these into visible design notes, rather than claiming to have solved them.

## Hardware and software pathway from the review

- **Hardware mentioned:** ESP8266 NodeMCU / ESP32, relays, PIR, LDR, DHT and MQ gas sensors, buzzer.
- **Communication/platform options mentioned:** Wi-Fi, MQTT, Arduino IoT Cloud, Blynk, Home Assistant.
- **Software approach mentioned:** Arduino IDE firmware and rule-based automation.
- **Evaluation mentioned:** response time, switching reliability, sensor accuracy, and alert delivery.

## Data honesty

All current dashboard metrics and sample activity events are illustrative. They are not measured results from the papers and are not live sensor data. In particular, the gas sensor tile is marked “Not connected” and must not be treated as a safety system.
