# Tinkercad Circuits build: Haven AC room-temperature controller

## Components (all in the Tinkercad Components panel)
| # | Component | Role in the house |
|---|-----------|-------------------|
| 1 | Arduino Uno R3 | Room controller (stands in for ESP32) |
| 2 | Temperature Sensor [TMP36] | Room temperature sensor |
| 3 | LCD 16 x 2 | Wall thermostat display |
| 4 | Relay SPDT | Switches the AC compressor |
| 5 | NPN Transistor (BJT) | Drives the relay coil |
| 6 | Diode | Flyback protection across the relay coil |
| 7 | DC Motor | AC compressor / fan |
| 8 | 9V Battery | Power for the motor (the "mains" side) |
| 9 | Micro Servo | AC louver / air vane |
| 10 | LED blue + LED green | Cooling indicator / at-target indicator |
| 11 | Resistors: 1 kΩ x1, 220 Ω x3 | Transistor base, LEDs, LCD backlight |

## Wiring
| From | To |
|------|----|
| TMP36 left pin (Vs) | 5V |
| TMP36 middle pin (Vout) | A0 |
| TMP36 right pin | GND |
| D7 | 1 kΩ resistor, then NPN base |
| NPN emitter | GND |
| NPN collector | Relay coil terminal 2 |
| Relay coil terminal 1 | 5V |
| Diode | across the coil (cathode to 5V, anode to the NPN collector) |
| 9V battery (+) | Relay COM |
| Relay NO | DC motor terminal 1 |
| DC motor terminal 2 | 9V battery (−) |
| D9 | Servo signal (servo power to 5V and GND) |
| D10 | 220 Ω, then blue LED anode; LED cathode to GND |
| D13 | 220 Ω, then green LED anode; LED cathode to GND |
| LCD GND, RW, K | GND |
| LCD VCC | 5V |
| LCD V0 (contrast) | GND (or a 10k pot wiper) |
| LCD A (backlight +) | 220 Ω, then 5V |
| LCD RS / E | D12 / D11 |
| LCD D4 / D5 / D6 / D7 | D5 / D4 / D3 / D2 |

Rail tip: join the Arduino 5V and GND to the breadboard rails first, then wire from the rails.

## Run it
1. Code, then Text, paste `haven_ac_controller.ino`, then Start Simulation.
2. Open the Serial Monitor (bottom of the code panel). You should see `READY`, then a `TEMP=...` line every second.
3. In the Haven app (Sensor room, Room climate control), type `25` as the outdoor temperature and press Adjust room temperature.
4. Click Copy Tinkercad command. You get one line, for example `OUT=25.0;SET=19;MODE=AUTO`.
5. Paste it into the Serial Monitor input box and Send.
6. Watch the circuit: relay clicks, motor spins, servo louver opens, blue LED lights, and the LCD counts down. At 19°C the relay drops out and the green LED lights.
7. Send `MODE=OFF` (or press Turn AC off in the app) to stop.

Try `OUT=30;SET=17;MODE=AUTO` or `OUT=35;SET=15;MODE=AUTO` to see other targets.

## Real hardware (optional)
Flash the same sketch to a real Arduino, set `SIMULATE_ROOM` to 0, connect it by USB, and in the app press Connect real Arduino (USB). The app then sends commands directly and shows live TEMP/AC readings from the board. This needs Chrome or Edge on a desktop.
