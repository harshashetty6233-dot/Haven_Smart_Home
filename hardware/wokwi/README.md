# Haven AC controller on Wokwi (no hardware needed)

1. Go to https://wokwi.com, then New Project, then Arduino Uno.
2. Open the `sketch.ino` tab, delete everything, and paste `sketch.ino` from this folder.
3. Open the `diagram.json` tab (the tab next to it), delete everything, and paste `diagram.json`. The circuit appears.
4. Press the green Start button.
5. Turn the potentiometer to set the "room temperature" (about 20 to 40 C). The LCD shows it.
6. In the Haven app press Adjust room temperature, then Copy Tinkercad command (it works for any simulator).
7. Click the Serial Monitor in Wokwi, paste the line (for example `OUT=25.0;SET=19;MODE=AUTO`) and press Enter.
8. The yellow LED (AC compressor) lights through the relay, the servo louver turns, the blue LED lights and the LCD temperature falls. At 19 C the green LED lights.
9. Send `MODE=OFF` to stop.
If the relay behaves backwards, set RELAY_ACTIVE_LOW to 1 in the sketch.
