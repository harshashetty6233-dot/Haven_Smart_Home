/*
  Haven Smart Home - AC room temperature controller
  Board : Arduino Uno R3 (Wokwi version: potentiometer on A0 stands in for the room sensor)

  Pins
    A0  Potentiometer = room temperature knob (20-40 C)
    D7  Relay module IN -> switches the AC compressor (yellow LED)
    D9  Servo (AC louver / air vane)
    D10 Blue LED   = AC cooling
    D13 Green LED  = room at target
    D12,D11,D5,D4,D3,D2 = LCD 16x2 (RS,E,D4,D5,D6,D7)

  Serial protocol (9600 baud)
    App -> board : OUT=25.0;SET=19;MODE=AUTO      (MODE=OFF switches AC off)
    Board -> app : TEMP=28.4;AC=ON;SET=19;MODE=AUTO   (once per second)

  Control rule (same as the Haven web app):
    AC ON  when room > SET + 0.5
    AC OFF when room <= SET
  SET is always limited to the 15-19 C comfort band.

  SIMULATE_ROOM = 1 : Tinkercad's TMP36 does not react to the AC, so the sketch
  models the room (AC cools it, heat leaks in from outdoors). Moving the TMP36
  slider re-syncs the model. Set to 0 on real hardware to use the sensor only.
*/
#include <LiquidCrystal.h>
#include <Servo.h>

#define SIMULATE_ROOM 1
#define RELAY_ACTIVE_LOW 0   // set to 1 if the relay clicks the wrong way round

const int PIN_SENSOR = A0;
const int PIN_RELAY  = 7;
const int PIN_SERVO  = 9;
const int PIN_LED_COOL = 10;
const int PIN_LED_OK   = 13;

const float MIN_T = 15.0, MAX_T = 19.0, HYST = 0.5;
const float COOL_PER_SEC = 0.35, LEAK = 0.012;   // matches the web simulation

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
Servo vane;

float targetC = 19.0, outdoorC = 25.0;
float roomC = 25.0, lastRaw = -100;
bool autoMode = false, acOn = false;
unsigned long lastTick = 0;

float readSensorC() {                       // pot 0..1023 -> 20..40 C
  return 20.0 + analogRead(PIN_SENSOR) * (20.0 / 1023.0);
}

void setAC(bool on) {
  acOn = on;
  digitalWrite(PIN_RELAY, (on != RELAY_ACTIVE_LOW) ? HIGH : LOW);
  digitalWrite(PIN_LED_COOL, on ? HIGH : LOW);
  vane.write(on ? 140 : 40);                // louver opens when cooling
}

void handleCommand(String line) {
  line.trim();
  while (line.length() > 0) {
    int sep = line.indexOf(';');
    String pair = (sep < 0) ? line : line.substring(0, sep);
    line = (sep < 0) ? "" : line.substring(sep + 1);
    int eq = pair.indexOf('=');
    if (eq < 0) continue;
    String key = pair.substring(0, eq);
    String val = pair.substring(eq + 1);
    key.trim(); val.trim();
    if (key == "OUT")  outdoorC = val.toFloat();
    if (key == "SET")  targetC = constrain(val.toFloat(), MIN_T, MAX_T);
    if (key == "MODE") {
      if (val == "AUTO") autoMode = true;
      if (val == "OFF")  { autoMode = false; setAC(false); }
    }
  }
}

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(100);                   // works with or without a newline
  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_LED_COOL, OUTPUT);
  pinMode(PIN_LED_OK, OUTPUT);
  vane.attach(PIN_SERVO);
  lcd.begin(16, 2);
  roomC = readSensorC();
  setAC(false);
  lcd.print("Haven AC ready");
  Serial.println("READY");
}

void loop() {
  if (Serial.available()) handleCommand(Serial.readString());

  if (millis() - lastTick >= 1000) {
    lastTick = millis();
    float raw = readSensorC();
#if SIMULATE_ROOM
    if (abs(raw - lastRaw) > 1.5) roomC = raw;      // user moved the TMP36 slider
    lastRaw = raw;
    roomC += (outdoorC - roomC) * LEAK;
    if (acOn) roomC -= COOL_PER_SEC;
#else
    roomC = raw;
#endif
    if (autoMode) {
      if (!acOn && roomC > targetC + HYST) setAC(true);
      else if (acOn && roomC <= targetC)   setAC(false);
    }
    digitalWrite(PIN_LED_OK, (autoMode && !acOn && roomC <= targetC + HYST) ? HIGH : LOW);

    lcd.setCursor(0, 0);
    lcd.print("T:"); lcd.print(roomC, 1); lcd.print("C SET:");
    lcd.print(autoMode ? (int)targetC : 0); lcd.print("C  ");
    lcd.setCursor(0, 1);
    lcd.print(acOn ? "AC:ON  COOLING  " : (autoMode ? "AC:OFF HOLDING " : "AC:OFF  IDLE   "));

    Serial.print("TEMP="); Serial.print(roomC, 1);
    Serial.print(";AC=");  Serial.print(acOn ? "ON" : "OFF");
    Serial.print(";SET="); Serial.print((int)targetC);
    Serial.print(";MODE="); Serial.println(autoMode ? "AUTO" : "OFF");
  }
}
