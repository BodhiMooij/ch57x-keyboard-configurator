/**
 * Small Keyboard — minimal firmware for the config app.
 * - USB CDC serial at 115200 (set in Serial.begin).
 * - VID/PID 0x1189/0x8890 are set in platformio.ini so the app shows "Small Keyboard".
 * - Receives one JSON line per "Send config"; optionally send IDENTIFY when a button is pressed.
 */

#include <Arduino.h>

// Optional: use ArduinoJson to parse config. Without it we just echo and ack.
// #include <ArduinoJson.h>

void setup() {
  Serial.begin(115200);
  // Wait for USB CDC (only needed on some boards)
  while (!Serial) {
    delay(10);
  }
  Serial.println("Small Keyboard ready");
}

void loop() {
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line.length() > 0) {
      // Config app sends one JSON line: {"keys":[...],"knob":{...},"leds":[...]}
      // Parse and apply keys/knob/leds here. For now just acknowledge.
      Serial.println("OK");

      // Optional: parse JSON and update your key map, knob mode, LED colors.
      // Example with ArduinoJson:
      //   StaticJsonDocument<512> doc;
      //   if (deserializeJson(doc, line) == DeserializeError::Ok) {
      //     JsonArray keys = doc["keys"]; ...
      //     JsonObject knob = doc["knob"]; ...
      //     JsonArray leds = doc["leds"]; ...
      //   }
    }
  }

  // Optional: when user presses "identify" button on the device, send IDENTIFY
  // so the app's "Select by button" can find this port.
  // if (identifyButtonPressed()) Serial.println("IDENTIFY");

  delay(5);
}
